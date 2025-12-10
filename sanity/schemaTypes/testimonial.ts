import { defineField, defineType } from 'sanity'
import { Quote } from 'lucide-react'

export const testimonial = defineType({
    name: 'testimonial',
    title: 'Testimonial',
    type: 'document',
    icon: Quote,
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'role',
            title: 'Role / Job Title',
            type: 'string',
            description: 'e.g. CEO of Company X',
        }),
        defineField({
            name: 'photo',
            title: 'Profile Photo',
            type: 'image',
            options: {
                hotspot: true,
            },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'testimonial',
            title: 'Testimonial',
            type: 'text',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'createdAt',
            title: 'Created At',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
        }),
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'role',
            media: 'photo',
        },
    },
})
