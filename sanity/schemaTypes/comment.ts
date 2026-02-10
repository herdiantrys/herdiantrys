import { defineField, defineType } from 'sanity'
import { MessageSquareText } from 'lucide-react'

export const comment = defineType({
    name: 'comment',
    title: 'Comment',
    type: 'document',
    icon: MessageSquareText,
    fields: [
        defineField({
            name: 'text',
            title: 'Text',
            type: 'text',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'project',
            title: 'Project',
            type: 'reference',
            to: [{ type: 'project' }],
        }),
        defineField({
            name: 'post',
            title: 'Post',
            type: 'reference',
            to: [{ type: 'post' }],
        }),
        defineField({
            name: 'user',
            title: 'User',
            type: 'reference',
            to: [{ type: 'user' }],
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
            title: 'text',
            subtitle: 'user.username',
        },
    },
})
