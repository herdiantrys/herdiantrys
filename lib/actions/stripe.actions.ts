"use server";

import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-01-27.acacia" as any, // Use latest or specific version
});

export const createCheckoutSession = async (itemId: string, userId: string, returnUrl: string) => {
    try {
        const item = await prisma.digitalProduct.findUnique({
            where: { id: itemId }
        });

        if (!item) throw new Error("Item not found");

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) throw new Error("User not found");

        // Ensure user has a stripe customer ID (optional, but good for tracking)
        let customerId = user.stripeCustomerId;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name || user.username || undefined,
                metadata: {
                    userId: user.id
                }
            });
            customerId = customer.id;

            await prisma.user.update({
                where: { id: userId },
                data: { stripeCustomerId: customerId }
            });
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            // payment_method_types is removed to enable Dynamic Payment Methods 
            // (configured in Stripe Dashboard -> Settings -> Payment Methods)
            // payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'idr',
                        product_data: {
                            name: item.title,
                            description: item.description || "Premium Item",
                            images: item.coverImage ? [item.coverImage] : [],
                        },
                        // IDR is treated as a decimal currency by Stripe (1 IDR = 100 units/cents), 
                        // unlike JPY which is zero-decimal.
                        // So for Rp 50,000, we need to send 5,000,000.
                        unit_amount: (item.price || 0) * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${returnUrl}?session_id={CHECKOUT_SESSION_ID}&item_id=${itemId}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/digitalproducts`,
            metadata: {
                userId: userId,
                itemId: itemId,
                type: item.category
            }
        });

        if (!session.url) throw new Error("Failed to create session URL");

        return { url: session.url };

    } catch (error: any) {
        console.error("Stripe Checkout Error:", error);
        return { error: error.message };
    }
};

export const verifyStripeSession = async (sessionId: string) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const userId = session.metadata?.userId;
            const itemId = session.metadata?.itemId;

            if (userId && itemId) {
                await prisma.digitalProductOwnership.create({
                    data: {
                        userId: userId,
                        productId: itemId
                    }
                }).catch((err) => {
                    // Ignore if already verified/exists
                    if (err.code !== 'P2002') console.error("Inventory Create Error", err);
                });

                // Initialize Portfolio Config if it's that type
                if (session.metadata?.type === "SAAS_TEMPLATE") {
                    await prisma.portfolioConfig.upsert({
                        where: { userId: userId },
                        create: { userId: userId, isEnabled: true },
                        update: { isEnabled: true }
                    });
                }

                return { success: true };
            }
        }
        return { success: false };
    } catch (error) {
        console.error("Verify Session Error:", error);
        return { success: false };
    }
};
