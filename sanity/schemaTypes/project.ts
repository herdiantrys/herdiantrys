import { defineField, defineType } from 'sanity'
import { Briefcase } from 'lucide-react'

export const project = defineType({
    name: 'project',
    title: 'Project',
    type: 'document',
    icon: Briefcase,
    fields: [
        defineField({
            name: 'title',
            title: 'Judul',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'category',
            title: 'Kategori',
            type: 'reference',
            to: [{ type: 'category' }],
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'album',
            title: 'Album / Katalog',
            type: 'string',
            description: 'Koleksi atau album dimana project ini berada',
        }),
        defineField({
            name: 'type',
            title: 'Tipe File',
            type: 'string',
            options: {
                list: [
                    { title: 'Image', value: 'image' },
                    { title: 'Video', value: 'video' },
                ],
                layout: 'radio',
            },
            initialValue: 'image',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'image',
            title: 'Image File',
            type: 'image',
            options: {
                hotspot: true,
            },
            hidden: ({ document }) => document?.type !== 'image',
        }),
        defineField({
            name: 'videoFile',
            title: 'Video File',
            type: 'file',
            options: {
                accept: 'video/*',
            },
            hidden: ({ document }) => document?.type !== 'video',
        }),
        defineField({
            name: 'content',
            title: 'Content / Isi',
            type: 'array',
            of: [{ type: 'block' }],
            description: 'Deskripsi lengkap project (bisa format rich text/HTML)',
        }),
        defineField({
            name: 'uploadDate',
            title: 'Tanggal Upload',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
        }),
        defineField({
            name: 'customUpdatedAt',
            title: 'Updated At',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
        }),
        defineField({
            name: 'views',
            title: 'Views',
            type: 'number',
            initialValue: 0,
        }),
        defineField({
            name: 'likes',
            title: 'Likes',
            type: 'array',
            of: [{ type: 'reference', to: { type: 'user' } }],
        }),
        defineField({
            name: 'comments',
            title: 'Comments Count',
            type: 'number',
            initialValue: 0,
            hidden: true, // Hidden in studio, updated via API
        }),
        defineField({
            name: 'favorite',
            title: 'Favorite',
            type: 'boolean',
            initialValue: false,
            description: 'Tampilkan di halaman depan (Home)',
        }),
        defineField({
            name: 'tags',
            title: 'Tags',
            type: 'array',
            of: [{ type: 'string' }],
            options: {
                layout: 'tags',
            },
        }),
        defineField({
            name: 'gallery',
            title: 'Gallery',
            type: 'array',
            of: [
                { type: 'image', options: { hotspot: true } },
                { type: 'file', title: 'Video', options: { accept: 'video/*' } }
            ],
            options: {
                layout: 'grid',
            },
        }),
    ],
    preview: {
        select: {
            title: 'title',
            category: 'category.title',
            media: 'image',
        },
        prepare(selection) {
            const { category } = selection
            return { ...selection, subtitle: category && `Category: ${category}` }
        },
    },
})
