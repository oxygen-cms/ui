import LegacyPage from "../components/LegacyPage.vue";

export default function(ui) {
    ui.addAuthenticatedRoutes([
        {
            // will match everything, try to render a legacy Oxygen page...
            path: '(pages|partials|upcoming-events)/:subpath*',
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