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
import CreatePageDropdown from "../components/pages/CreatePageDropdown.vue";
import CreatePartialDropdown from "../components/partials/CreatePartialDropdown.vue";

export default function(ui) {
    ui.addMainMenuGroup(WEB_CONTENT, {
        name: 'Pages',
        icon: 'file-alt',
        listAction: '/pages',
        listPermission: 'pages.getList',
        addIcon: 'plus',
        addPermission: 'pages.postCreate',
        addAction: '/pages/create',
        addDropdownComponent: CreatePageDropdown,
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
        addDropdownComponent: CreatePartialDropdown,
        items: {
        }
    });

    const partialsProps = { displayName: 'Partials', routePrefix: 'partials', inTrash: false, tableComponent: PartialTable, actionsComponent: PartialActions, singularDisplayName: 'Partial', defaultSortField: 'title', defaultSortOrder: 'asc', resourceApi: new PartialsApi(), createDropdownComponent: CreatePartialDropdown }
    const pagesProps = { displayName: 'Pages', routePrefix: 'pages', inTrash: false, tableComponent: PageTable, actionsComponent: PageActions, singularDisplayName: 'Page', defaultSortField: 'title', defaultSortOrder: 'asc', resourceApi: new PagesApi(), createDropdownComponent: CreatePageDropdown }

    ui.addAuthenticatedRoutes([
        {
            path: '(pages|partials)/:subpath/edit',
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
            path: 'partials/trash',
            name: 'partials.trash',
            component: ResourceList,
            meta: { title: 'Deleted Partials' },
            props: { ...partialsProps, inTrash: true }
        },
        {
            path: 'partials',
            name: 'partials.list',
            component: ResourceList,
            meta: { title: 'List Partials' },
            props: { ...partialsProps, inTrash: false }
        },
        {
            path: 'partials/:id',
            redirect: to => {
                return { path: 'partials/' + to.params.id + '/edit' }
            }
        },
        {
            path: 'partials/create',
            redirect: 'partials/create'
        },
        {
            path: 'pages/trash',
            name: 'pages.trash',
            component: ResourceList,
            meta: { title: 'Deleted Pages' },
            props: { ...pagesProps, inTrash: true }
        },
        {
            path: 'pages/:id',
            name: 'pages.edit',
            component: PageEdit,
            meta: { title: 'Edit Page' }
        },
        {
            path: 'pages',
            name: 'pages.list',
            component: ResourceList,
            meta: { title: 'List Pages' },
            props: { ...pagesProps, inTrash: false }
        }
    ]);
}