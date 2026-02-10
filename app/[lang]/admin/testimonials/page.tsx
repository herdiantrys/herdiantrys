import { getTestimonials } from "@/lib/actions/testimonial.actions";
import AdminTestimonialsClient from "@/components/Admin/AdminTestimonialsClient";

export default async function AdminTestimonialsPage() {
    const { data: testimonials } = await getTestimonials();

    return (
        <AdminTestimonialsClient testimonials={testimonials || []} />
    );
}
