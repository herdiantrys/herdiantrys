import { defineField, defineType } from 'sanity'
import { Sparkles } from 'lucide-react'

export const service = defineType({
    name: 'service',
    title: 'Service',
    type: 'document',
    icon: Sparkles,
    fields: [
        defineField({
            name: 'title',
            title: 'Service Title',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 3,
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'price',
            title: 'Price',
            type: 'string',
            description: 'e.g. "$500" or "Starting at $500"',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'image',
            title: 'Service Image',
            type: 'image',
            options: {
                hotspot: true,
            },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'features',
            title: 'Features',
            type: 'array',
            of: [{ type: 'string' }],
            description: 'List of features included in this service',
        }),
        defineField({
            name: 'buttonText',
            title: 'Button Text',
            type: 'string',
            initialValue: 'Order Now',
        }),
        defineField({
            name: 'orderLink',
            title: 'Order Link',
            type: 'url',
            description: 'Link to payment or contact form',
        }),
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'price',
            media: 'image',
        },
    },
})
