<template>
    <div class="columns">
        <div class="column is-one-fifth left-navigation-container">
            <b-menu class="left-navigation">

            </b-menu>
        </div>

        <div class="column pad">
            <transition name="quick-fade" mode="out-in">
                <router-view></router-view>
            </transition>
        </div>
    </div>
</template>

<script>
export default {
  name: "UserProfile"
}
</script>

<style scoped lang="scss">
    @import 'left-navbar.scss';
</style>
