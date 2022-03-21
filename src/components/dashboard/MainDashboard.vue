<template>
    <div class="full-height scroll-container">
        <div class="has-background-white-ter">
            <div class="container hero is-medium">
                <div class="hero-body">
                    <h1 class="title" style="font-size: 3rem;">
                        <transition name="fade">
                            <span v-if="user">Welcome, {{ user.fullName }}</span>
                        </transition>
                    </h1>
                    <br>
                    <h2 class="subtitle">The Oxygen CMS administration panel allows you to edit the site content, manage events and more.</h2>
                </div>
            </div>
        </div>

        <div class="has-background-white">
            <div class="container hero">
                <div class="hero-body">
                    <section class="tile is-ancestor">
                        <div class="tile is-parent">
                            <div class="tile is-child heading-box">
                                <h2 class="title">Manage site</h2>
                            </div>
                        </div>
                    </section>

                    <div class="grid-loading">
                        <b-loading :active="!userPermissions" :is-full-page="false"></b-loading>
                        <transition name="fade">
                            <section class="tile is-ancestor" v-if="userPermissions">
                                <div class="tile is-vertical" v-for="group in panels">
                                    <div class="tile is-parent is-vertical" v-if="userPermissions && userPermissions.hasOneOf(group.map(panel => panel.permission))">
                                        <div v-for="panel in group" :key="panel.name" class="tile is-child notification">
                                            <component :is="panel.component"></component>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </transition>
                    </div>

                </div>
            </div>
        </div>

        <component v-for="(item, i) in extraRows" :is="item" :key="i"></component>
    </div>
</template>

<script>
    export default {
        name: "MainDashboard",
        props: {
            panels: Array,
            extraRows: Array
        },
        data() {
            return {
            }
        },
        computed: {
            userPermissions() { return this.$store.getters.userPermissions; },
            user() { return this.$store.state.user; }
        },
    }
</script>

<style scoped>
    .title .icon {
        margin-left: 1rem;
    }

    .grid-loading {
        position: relative;
        min-height: 30rem;
    }

    .notification {
        text-align: center;
    }
</style>
