import TestimonialForm from "@/components/Admin/TestimonialForm";
import { getTestimonialById } from "@/lib/actions/testimonial.actions";
import { notFound } from "next/navigation";

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data: testimonial } = await getTestimonialById(id);

    if (!testimonial) {
        return notFound();
    }

    return (
        <TestimonialForm testimonial={testimonial} isEdit />
    );
}
