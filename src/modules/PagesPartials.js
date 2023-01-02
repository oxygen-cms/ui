import LegacyPage from "../components/LegacyPage.vue";
import { WEB_CONTENT } from "../main.js";
import PageCreate from "../components/PageCreate.vue";

export default function(ui) {
    ui.addMainMenuGroup(WEB_CONTENT, {
        name: 'Pages',
        icon: 'file-alt',
        listAction: '/pages',
        listPermission: 'pages.getList',
        addIcon: 'plus',
        addPermission: 'pages.postCreate',
        addAction: '/pages/create',
        items: {
        }
    });
    ui.addMainMenuGroup(WEB_CONTENT, {
        name: 'Partials',
        icon: 'puzzle-piece',
        listAction: '/partials',
        listPermission: 'partials.getList',
        addIcon: 'plus',
        addPermission: 'partials.postCreate',
        addAction: '/partials/create',
        items: {
        }
    });
    ui.addAuthenticatedRoutes([
        {
            // will match everything, try to render a legacy Oxygen page...
            path: '(pages|partials)/:subpath*',
            component: LegacyPage,
            props: (route) => {
                return {
                    fullPath: route.fullPath,
                    legacyPrefix: '/oxygen/view',
                    adminPrefix: '/oxygen'
                }
            }
        },
        {
            path: 'pages2',
            component: PageCreate
        }
    ]);
}