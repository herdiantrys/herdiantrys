"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import Midtrans from "midtrans-client";
import Stripe from "stripe";
import { serializeForClient } from "@/lib/utils";

// Make sure to add these to your .env
// MIDTRANS_SERVER_KEY=
// MIDTRANS_CLIENT_KEY=
// STRIPE_SECRET_KEY=
// NEXT_PUBLIC_APP_URL=http://localhost:3000

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2024-06-20" as any, // Use your supported api version
});

const midtransCore = new Midtrans.CoreApi({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    clientKey: process.env.MIDTRANS_CLIENT_KEY || ""
});

const midtransSnap = new Midtrans.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    clientKey: process.env.MIDTRANS_CLIENT_KEY || ""
});

export async function createCheckoutSession(productId: string, gateway: "MIDTRANS" | "STRIPE" = "MIDTRANS") {
    try {
        const session = await auth();
        if (!session?.user) {
            return serializeForClient({ success: false, error: "Unauthorized" });
        }

        const product = await prisma.digitalProduct.findUnique({
            where: { id: productId }
        });

        if (!product || !product.isPublished) {
            return serializeForClient({ success: false, error: "Product not found or unavailable." });
        }

        // 1. Create Order Record in DB (Status: PENDING)
        const order = await prisma.order.create({
            data: {
                userId: session.user.id as string,
                productId: product.id,
                amount: product.price,
                currency: product.currency,
                status: "PENDING",
                paymentProvider: gateway.toLowerCase(),
            }
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

        // 2. Route to specific gateway implementations
        if (gateway === "STRIPE") {
            const stripeSession = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                    {
                        price_data: {
                            currency: product.currency.toLowerCase(),
                            product_data: {
                                name: product.title,
                                description: product.description || undefined,
                                images: product.coverImage ? [product.coverImage] : undefined,
                            },
                            unit_amount: product.currency === "IDR" ? product.price * 100 : product.price, // Adjust based on currency minimums
                        },
                        quantity: 1,
                    },
                ],
                mode: "payment",
                success_url: `${appUrl}/checkout/success?orderId=${order.id}`,
                cancel_url: `${appUrl}/checkout/cancel?orderId=${order.id}`,
                client_reference_id: order.id,
                metadata: {
                    userId: session.user.id as string,
                    productId: product.id,
                    orderId: order.id
                }
            });

            await prisma.order.update({
                where: { id: order.id },
                data: {
                    paymentId: stripeSession.id,
                    checkoutUrl: stripeSession.url
                }
            });

            return serializeForClient({ success: true, url: stripeSession.url });
        }

        if (gateway === "MIDTRANS") {
            const parameter = {
                transaction_details: {
                    order_id: order.id,
                    gross_amount: product.price
                },
                credit_card: {
                    secure: true
                },
                customer_details: {
                    first_name: session.user.name || "Customer",
                    email: session.user.email || ""
                },
                item_details: [{
                    id: product.id,
                    price: product.price,
                    quantity: 1,
                    name: product.title
                }]
            };

            const snapTransaction = await midtransSnap.createTransaction(parameter);

            await prisma.order.update({
                where: { id: order.id },
                data: {
                    paymentId: snapTransaction.token,
                    checkoutUrl: snapTransaction.redirect_url
                }
            });

            return serializeForClient({ success: true, url: snapTransaction.redirect_url, token: snapTransaction.token });
        }

        return serializeForClient({ success: false, error: "Invalid gateway selection." });

    } catch (error: any) {
        console.error("Checkout session creation failed:", error);
        return serializeForClient({ success: false, error: error.message || "Failed to initiate checkout." });
    }
}

// Function to handle webhook or manual verification after successful payment return
export async function verifyAndFulfillOrder(orderId: string) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { product: true }
        });

        if (!order) return { success: false, error: "Order not found" };
        if (order.status === "SUCCESS") return { success: true, message: "Already fulfilled." };

        // Real app should verify with Stripe/Midtrans using the paymentId/orderId first here.
        // For demonstration, we'll mark as success if called.
        // midtransCore.transaction.status(order.id).then((res)=>{ ... })

        await prisma.$transaction(async (tx) => {
            await tx.order.update({
                where: { id: order.id },
                data: { status: "SUCCESS" }
            });

            // Grant Ownership
            await tx.digitalProductOwnership.create({
                data: {
                    userId: order.userId,
                    productId: order.productId
                }
            });
        });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
