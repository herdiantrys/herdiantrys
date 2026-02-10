import { defineField, defineType } from 'sanity'
import { ShoppingBag } from 'lucide-react'

export const shopItem = defineType({
    name: 'shopItem',
    title: 'Shop Item',
    type: 'document',
    icon: ShoppingBag,
    fields: [
        defineField({
            name: 'name',
            title: 'Item Name',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
        }),
        defineField({
            name: 'price',
            title: 'Price (Points)',
            type: 'number',
            validation: (rule) => rule.required().min(0),
        }),
        defineField({
            name: 'type',
            title: 'Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Avatar Border', value: 'frame' },
                    { title: 'Profile Background', value: 'background' },
                    { title: 'Courses', value: 'course' },
                ],
            },
            initialValue: 'frame',
        }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'string',
            options: {
                list: [
                    { title: 'Cosmetics', value: 'cosmetics' },
                    { title: 'Designs', value: 'designs' },
                    { title: 'Courses', value: 'courses' },
                    { title: 'Apps', value: 'apps' },
                ],
                layout: 'radio'
            },
            initialValue: 'cosmetics',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'value',
            title: 'CSS Class / Value',
            type: 'string',
            description: 'Tailwind classes or specific identifier for the effect',
        }),
        defineField({
            name: 'icon',
            title: 'Icon/Preview Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'price',
            media: 'icon',
        },
    },
})
