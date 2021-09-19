<template>
    <span>{{ joined }}, on {{ joinedAbs }}</span>
</template>

<script>
import Internationalize from "../Internationalize";

export default {
    name: "UserJoined",
    props: {
        user: {
            type: Object,
            required: true
        }
    },
    computed: {
        joined() {
            const rtf1 = new Intl.RelativeTimeFormat('en', { style: 'narrow' });
            let daysSinceJoined = (new Date(this.user.createdAt) - new Date()) / (1000 * 24 * 60 * 60);
            let shouldUseYears = daysSinceJoined < -400;
            return rtf1.format(
                Math.round(shouldUseYears ? daysSinceJoined / 365 : daysSinceJoined),
                shouldUseYears ? 'year' : 'day'
            );
        },
        joinedAbs() {
            return Internationalize.formatDate(this.user.createdAt);
        },
    }
}
</script>

<style scoped>

</style>