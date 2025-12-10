import { defineField, defineType } from 'sanity'
import { Handshake } from 'lucide-react'

export const partner = defineType({
    name: 'partner',
    title: 'Partner',
    type: 'document',
    icon: Handshake,
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
