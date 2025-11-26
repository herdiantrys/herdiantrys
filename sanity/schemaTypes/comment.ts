import { defineField, defineType } from 'sanity'

export const comment = defineType({
    name: 'comment',
    title: 'Comment',
    type: 'document',
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
            validation: (rule) => rule.required(),
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
