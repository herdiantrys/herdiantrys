import { defineField, defineType } from 'sanity'
import { Mail } from 'lucide-react'

export const contact = defineType({
    name: 'contact',
    title: 'Contact Messages',
    type: 'document',
    icon: Mail,
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'email',
            title: 'Email',
            type: 'string',
            validation: (rule) => rule.required().email(),
        }),
        defineField({
            name: 'message',
            title: 'Message',
            type: 'text',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'createdAt',
            title: 'Created At',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
            readOnly: true,
        }),
        defineField({
            name: 'read',
            title: 'Read',
            type: 'boolean',
            initialValue: false,
        }),
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'email',
        },
    },
})
