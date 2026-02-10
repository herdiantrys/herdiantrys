import { defineField, defineType } from 'sanity'
import { MessageSquare } from 'lucide-react'

export const post = defineType({
    name: 'post',
    title: 'Post',
    type: 'document',
    icon: MessageSquare,
    fields: [
        defineField({
            name: 'text',
            title: 'Text Content',
            type: 'text',
            validation: (rule) => rule.required().min(1).max(500),
        }),
        defineField({
            name: 'image',
            title: 'Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'author',
            title: 'Author',
            type: 'reference',
            to: [{ type: 'user' }],
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'likes',
            title: 'Likes',
            type: 'array',
            of: [{ type: 'reference', to: { type: 'user' } }],
        }),
        defineField({
            name: 'createdAt',
            title: 'Created At',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
        }),
        defineField({
            name: 'isArchived',
            title: 'Is Archived',
            type: 'boolean',
            initialValue: false,
        }),
    ],
    preview: {
        select: {
            title: 'text',
            subtitle: 'author.username',
            media: 'image',
        },
    },
})
