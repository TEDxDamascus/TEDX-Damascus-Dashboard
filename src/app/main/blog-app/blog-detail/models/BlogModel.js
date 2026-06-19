import _ from 'lodash';
import { defaultLocaleValue } from '../../../../shared-components/locale-input';

const BlogModel = (data) =>
  _.defaults(data || {}, {
    id: _.uniqueId('blog-'),
    title: defaultLocaleValue(),
    slug: defaultLocaleValue(),
    description: defaultLocaleValue(),
    content: defaultLocaleValue(),
    status: 'draft',
    publishedAt: null,
    blog_category: null,
    tags: [],
    views_count: 0,
    read_time: 0,
    blog_image: { id: '', url: '' },
    og_image: { id: '', url: '' },
    gallery: [],
    meta_title: defaultLocaleValue(),
    meta_description: defaultLocaleValue(),
    meta_keywords: defaultLocaleValue(),
    canonical_url: '',
    og_title: defaultLocaleValue(),
    og_description: defaultLocaleValue(),
    author_user: null,
    // Frontend-only fields (ask backend to add):
    related_blogs: [],
    /** { reference_id?: string, name, desc, url } — reference_id set when loaded from API */
    blog_references: [],
  });

export default BlogModel;
