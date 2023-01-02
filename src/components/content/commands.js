import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import {items} from './suggestion'

export default Extension.create({
    name: 'commands',

    addOptions() {
        return {
            suggestion: {
                char: '/',
                allowSpaces: true,
                command: ({editor, range, props}) => {
                    let command = editor.chain().focus().deleteRange(range);
                    command = props.command({ editor, range, command });
                    command.run();
                },
                items: items,
                render: function() {
                    let editorComponent
                    return {
                        onStart: (props) => {
                            editorComponent = props.editor.editorComponent;
                            if(!props.clientRect)
                            {
                                editorComponent.commandsListVisible = false;
                                return;
                            }

                            // console.log(props);

                            let rect = props.clientRect();
                            // console.log(rect, props.editor.editorComponent);
                            editorComponent.commandsListVisible = true;
                            editorComponent.commandsListTop = rect.top;
                            editorComponent.commandsListLeft = rect.left;
                            editorComponent.commandsListItems = props.items;
                            editorComponent.commandsListCommand = props.command;
                        },

                        onUpdate(props) {
                            let rect = props.clientRect();
                            // console.log(rect, props.editor.editorComponent);
                            editorComponent.commandsListTop = rect.top;
                            editorComponent.commandsListLeft = rect.left;
                            editorComponent.commandsListItems = props.items;
                            editorComponent.commandsListCommand = props.command;
                        },

                        onKeyDown(props) {
                            console.log(props);
                            if (props.event.key === 'Escape') {
                                editorComponent.commandsListVisible = false;
                                return true
                            }
                            return editorComponent.$refs['commandsList'].onKeyDown(props);
                        },

                        onExit(props) {
                            console.log(props);
                            editorComponent.commandsListVisible = false;
                            // popup[0].destroy()
                            // component.destroy()
                        },
                    }
                },
            },
        }
    },

    addProseMirrorPlugins() {
        this.editor.editorComponent = this.options.editorComponent;
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
            }),
        ];
    },
})