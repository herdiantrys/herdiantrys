import { defineField, defineType } from 'sanity'

export const partner = defineType({
    name: 'partner',
    title: 'Partner',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Partner Name',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'icon',
            title: 'Icon / Logo',
            type: 'image',
            options: {
                hotspot: true,
            },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'url',
            title: 'Website URL',
            type: 'url',
        }),
    ],
})
