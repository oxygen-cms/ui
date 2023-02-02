import LegacyPage from "../components/LegacyPage.vue";
import { WEB_CONTENT } from "../main.js";
import PageEdit from "../components/PageEdit.vue";
import ResourceList from "../components/ResourceList.vue";
import PageTable from "../components/PageTable.vue";
import PagesApi from "../PagesApi.js";
import PartialsApi from "../PartialsApi.js";
import PartialTable from "../components/PartialTable.vue";
import PageActions from "../components/PageActions.vue";
import PartialActions from "../components/PartialActions.vue";

export default function(ui) {
    ui.addMainMenuGroup(WEB_CONTENT, {
        name: 'Pages',
        icon: 'file-alt',
        listAction: '/pages2',
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
        listAction: '/partials2',
        listPermission: 'partials.getList',
        addIcon: 'plus',
        addPermission: 'partials.postCreate',
        addAction: '/partials/create',
        items: {
        }
    });

    const partialsProps = { displayName: 'Partials', routePrefix: 'partials2', inTrash: false, tableComponent: PartialTable, actionsComponent: PartialActions, singularDisplayName: 'Partial', defaultSortField: 'title', defaultSortOrder: 'asc', resourceApi: new PartialsApi() }
    const pagesProps = { displayName: 'Pages', routePrefix: 'pages2', inTrash: false, tableComponent: PageTable, actionsComponent: PageActions, singularDisplayName: 'Page', defaultSortField: 'title', defaultSortOrder: 'asc', resourceApi: new PagesApi() }

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
            path: 'partials2/trash',
            name: 'partials.trash',
            component: ResourceList,
            meta: { title: 'Deleted Partials' },
            props: { ...partialsProps, inTrash: true }
        },
        {
            path: 'partials2',
            name: 'partials.list',
            component: ResourceList,
            meta: { title: 'List Partials' },
            props: { ...partialsProps, inTrash: false }
        },
        {
            path: 'partials2/:id',
            redirect: to => {
                return { path: 'partials/' + to.params.id + '/edit' }
            }
        },
        {
            path: 'partials2/create',
            redirect: 'partials/create'
        },
        {
            path: 'pages2/trash',
            name: 'pages.trash',
            component: ResourceList,
            meta: { title: 'Deleted Pages' },
            props: { ...pagesProps, inTrash: true }
        },
        {
            path: 'pages2/:id',
            name: 'pages.edit',
            component: PageEdit,
            meta: { title: 'Edit Page' }
        },
        {
            path: 'pages2/create',
            redirect: 'pages/create'
        },
        {
            path: 'pages2',
            name: 'pages.list',
            component: ResourceList,
            meta: { title: 'List Pages' },
            props: { ...pagesProps, inTrash: false }
        }
    ]);
}