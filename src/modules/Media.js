import MediaPage from "../components/media/MediaPage.vue";
import MediaResponsiveImages from "../components/media/MediaResponsiveImages.vue";
import {WEB_CONTENT} from "../main";

export default function(ui) {
    ui.addMainMenuGroup(WEB_CONTENT, {
        name: 'Photos & Files',
        icon: 'photo-video',
        groupPrefix: '/media',
        addAction: '/media/list/?upload=true',
        addIcon: 'upload',
        addPermission: 'media.postCreate',
        listAction: '/media/list',
        listPermission: 'media.getList',
        items: {
            'Deleted Photos & Files': { to: '/media/trash', permission: 'media.getList' },
            'Responsive Images': { to: '/media/responsive-images', permission: 'media.postMakeResponsive' }
        }
    });
    ui.addAuthenticatedRoutes([
        {
            path: 'media/list/:currentPath(.*)?',
            name: 'media.list',
            props: true,
            component: MediaPage,
            meta: { title: 'Photos & File Uploads'}
        },
        {
            path: 'media/list',
            props: {
                currentPath: ''
            },
            component: MediaPage,
            meta: { title: 'Photos & File Uploads'}
        },
        {
            path: 'media/trash',
            name: 'media.trash',
            props: {
                inTrash: true,
                currentPath: ''
            },
            component: MediaPage,
            meta: { title: 'Deleted Photos & File Uploads'}
        },
        {
            path: 'media/search/:searchQuery',
            name: 'media.search',
            props: true,
            component: MediaPage,
            meta: { title: 'Search Photos & File Uploads'}
        },
        {
            path: 'media/responsive-images',
            name: 'media.responsiveImages',
            component: MediaResponsiveImages,
            meta: { title: 'Responsive Images'}
        }
    ]);
}