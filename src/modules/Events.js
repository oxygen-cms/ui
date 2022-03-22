import LegacyPage from "../components/LegacyPage.vue";
import { WEB_CONTENT } from "../main.js";
import PreferencesEventTemplates from "../components/preferences/PreferencesEventTemplates.vue";

export default function(ui) {
    ui.addMainMenuGroup(WEB_CONTENT, {
        name: 'Events',
        icon: 'calendar-alt',
        listAction: '/upcoming-events',
        listPermission: 'upcomingEvents.getList',
        addIcon: 'calendar-plus',
        addPermission: 'upcomingEvents.postCreate',
        addAction: '/upcoming-events/create',
        items: {
        }
    });
    ui.extraPrefs['appearance'].push({
        key: 'appearance.events',
        component: PreferencesEventTemplates
    });
    ui.addAuthenticatedRoutes([
        {
            // will match everything, try to render a legacy Oxygen page...
            path: 'upcoming-events/:subpath*',
            component: LegacyPage,
            props: (route) => {
                return {
                    fullPath: route.fullPath,
                    legacyPrefix: '/oxygen/view',
                    adminPrefix: '/oxygen'
                }
            }
        }
    ]);
}