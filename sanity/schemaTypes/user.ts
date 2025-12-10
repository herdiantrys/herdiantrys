import { defineField, defineType } from 'sanity'
import { Users } from 'lucide-react'

export const user = defineType({
    name: 'user',
    title: 'User',
    type: 'document',
    icon: Users,
    fields: [
        defineField({
            name: 'username',
            title: 'Username',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'fullName',
            title: 'Full Name',
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
            name: 'password',
            title: 'Password',
            type: 'string',
        }),
        defineField({
            name: 'profileImage',
            title: 'Profile Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'bannerImage',
            title: 'Banner Image',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
        defineField({
            name: 'imageURL',
            title: 'Image URL',
            type: 'string',
            description: 'URL for external provider images (e.g. Google)',
        }),
        defineField({
            name: 'headline',
            title: 'Headline',
            type: 'string',
        }),
        defineField({
            name: 'bio',
            title: 'Bio',
            type: 'text',
        }),
        defineField({
            name: 'location',
            title: 'Location',
            type: 'string',
        }),
        defineField({
            name: 'socialLinks',
            title: 'Social Links',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({ name: 'platform', title: 'Platform', type: 'string' }),
                        defineField({ name: 'url', title: 'URL', type: 'url' }),
                    ],
                },
            ],
        }),
    ],
    preview: {
        select: {
            title: 'username',
            subtitle: 'fullName',
            media: 'profileImage',
        },
    },
})
