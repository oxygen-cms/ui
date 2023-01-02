<template>
    <b-dropdown v-model="selectedIndex" ref="dropdown" :inline="true" :scrollable="true" class="items" :style="{ top: (top + 30) + 'px', left: (left + 4) + 'px', display: !visible ? 'none !important' : 'inherit' }" @change="index => selectItem(items[index])">
        <b-dropdown-item
            v-for="(item, index) in items"
            :key="index"
            :value="index"
            @click="selectItem(item)"
        >
            <b-icon :icon="item.icon"></b-icon>
            {{ item.title }}
        </b-dropdown-item>
<!--        </b-dropdown-item>-->
        <b-dropdown-item v-if="items.length === 0">
            No result
        </b-dropdown-item>
    </b-dropdown>
</template>

<script>
export default {
    props: {
        items: {
            type: Array,
            required: true,
        },
        command: {
            type: Function,
            required: true,
        },
        top: {
            type: Number,
            required: true
        },
        left: {
            type: Number,
            required: true
        },
        visible: {
            type: Boolean,
            required: true
        }
    },

    data() {
        return {
            selectedIndex: 0,
        }
    },

    watch: {
        items() {
            this.selectedIndex = 0
        },
    },

    methods: {
        onKeyDown({ event }) {
            if (event.key === 'ArrowUp') {
                this.upHandler()
                return true
            }

            if (event.key === 'ArrowDown') {
                this.downHandler()
                return true
            }

            if (event.key === 'Enter') {
                this.enterHandler()
                return true
            }

            return false
        },
        upHandler() {
            this.selectedIndex = ((this.selectedIndex + this.items.length) - 1) % this.items.length;
            let el = this.$refs.dropdown.$children[this.selectedIndex].$el;
            el.scrollIntoView({
                block: 'nearest'
            });
        },
        downHandler() {
            this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
            let el = this.$refs.dropdown.$children[this.selectedIndex].$el;
            el.scrollIntoView({
                block: 'nearest'
            });
        },
        enterHandler() {
            const item = this.items[this.selectedIndex];
            this.selectItem(item)
        },
        selectItem(item) {
            if (item) {
                this.command(item)
            }
        },
    },
}
</script>

<style lang="scss">
.items {
    left: 10;
    position: absolute;
    z-index: 9999;
}
</style>