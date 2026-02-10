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
            name: 'role',
            title: 'Role',
            type: 'string',
            options: {
                list: [
                    { title: 'Super Admin', value: 'super-admin' },
                    { title: 'Admin', value: 'admin' },
                    { title: 'Moderator', value: 'moderator' },
                    { title: 'Writer', value: 'writer' },
                    { title: 'User', value: 'user' },
                ],
                layout: 'radio',
            },
            initialValue: 'user',
            validation: (rule) => rule.required(),
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
        defineField({
            name: 'bookmarks',
            title: 'Saved Projects',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'project' }, { type: 'post' }] }],
        }),
        defineField({
            name: 'likes',
            title: 'Likes',
            type: 'array',
            of: [{ type: 'reference', to: { type: 'user' } }],
        }),
        defineField({
            name: 'points',
            title: 'Points',
            type: 'number',
            initialValue: 0,
            validation: (rule) => rule.min(0),
        }),
        defineField({
            name: 'lastLoginBonusDate',
            title: 'Last Login Bonus Date',
            type: 'datetime',
        }),
        defineField({
            name: 'inventory',
            title: 'Inventory',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({ name: 'item', title: 'Item', type: 'reference', to: [{ type: 'shopItem' }] }),
                        defineField({ name: 'acquiredAt', title: 'Acquired At', type: 'datetime', initialValue: () => new Date().toISOString() }),
                    ],
                    preview: {
                        select: {
                            title: 'item.name',
                            subtitle: 'acquiredAt',
                            media: 'item.icon',
                        },
                    },
                },
            ],
        }),
        defineField({
            name: 'equippedEffect',
            title: 'Equipped Effect',
            type: 'string',
            description: 'The value/class of the currently equipped profile effect',
        }),
        defineField({
            name: 'preferences',
            title: 'Preferences',
            type: 'object',
            fields: [
                defineField({
                    name: 'language',
                    title: 'Language',
                    type: 'string',
                    options: {
                        list: [
                            { title: 'English', value: 'en' },
                            { title: 'Indonesian', value: 'id' },
                        ],
                    },
                    initialValue: 'en',
                }),
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
