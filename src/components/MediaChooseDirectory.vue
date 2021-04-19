<template>
    <b-dropdown
        position="is-top-left"
        append-to-body
        aria-role="menu"
        trap-focus
        ref="dropdown"
    >
        <template #trigger>
            <b-button size="is-small" rounded icon-left="landmark">
                <span>Move to directory</span>
            </b-button>
        </template>


        <b-dropdown-item
            aria-role="menu-item"
            :focusable="false"
            custom
            paddingless>
            <div class="modal-card" style="width: 40rem; overflow: visible;">
                <section class="modal-card-body" style="overflow: visible;">
                    <b-field label="Choose a directory">
                        <b-autocomplete
                            :disabled="isLoading"
                            v-model="searchQuery"
                            open-on-focus
                            :data="directoriesList"
                            :custom-formatter="data => getDirectoryPathString(data)"
                            placeholder="Search for directories..."
                            clearable
                            @select="selectDirectory">
                            <template #empty>No results found</template>
                        </b-autocomplete>
                    </b-field>
                </section>
                <footer class="modal-card-foot is-flex">
                    <div class="is-flex-grow-1"></div>
                    <b-button
                        label="Close"
                        @click="close"/>
                    <b-button
                        :disabled="selectedDirectory === null"
                        label="Move"
                        type="is-primary"
                        @click="submit"/>
                </footer>
            </div>

<!--            <form action="">-->
<!--                <div class="modal-card" style="width:300px;">-->
<!--                    <section class="modal-card-body">-->
<!--                        <b-field label="Email">-->
<!--                            <b-input-->
<!--                                type="email"-->
<!--                                placeholder="Your email"-->
<!--                                required>-->
<!--                            </b-input>-->
<!--                        </b-field>-->

<!--                        <b-field label="Password">-->
<!--                            <b-input-->
<!--                                type="password"-->
<!--                                password-reveal-->
<!--                                placeholder="Your password"-->
<!--                                required>-->
<!--                            </b-input>-->
<!--                        </b-field>-->

<!--                        <b-checkbox>Remember me</b-checkbox>-->
<!--                    </section>-->
<!--            </form>-->
        </b-dropdown-item>
    </b-dropdown>
</template>

<script>
import MediaDirectoryApi, {getDirectoryPathString} from "../MediaDirectoryApi";

export default {
    name: "MediaChooseDirectory",
    data() {
        return {
            mediaDirectoryApi: new MediaDirectoryApi(this.$buefy),
            newDirectory: null,
            isLoading: false,
            searchQuery: '',
            directoriesList: [],
            selectedDirectory: null,
            getDirectoryPathString: getDirectoryPathString
        }
    },
    created() {
        this.fetchData()
    },
    methods: {
        async fetchData() {
            this.isLoading = true;
            let data = await this.mediaDirectoryApi.list(false, 1, null);
            this.directoriesList = data.items;
            this.directoriesList.sort((a, b) => {
                return getDirectoryPathString(a).localeCompare(getDirectoryPathString(b))
            });
            this.isLoading = false;
        },
        debounceFetchData() {
            clearTimeout(this.searchDebounce)
            this.searchDebounce = setTimeout(() => {
                this.fetchData();
            }, 400);
        },
        submit() {
            this.$emit('submit', this.selectedDirectory);
            this.close();
        },
        selectDirectory(option) {
            this.selectedDirectory = option;
        },
        close() {
            this.selectedDirectory = null;
            this.searchQuery = '';
            this.$refs.dropdown.toggle();
        }
    }
}
</script>

<style scoped>

</style>
