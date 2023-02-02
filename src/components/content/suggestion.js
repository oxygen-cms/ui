export function items({ query, canConvert }) {
    let items = [
        {
            title: 'Paragraph',
            icon: 'paragraph',
            canConvert: true,
            node: ({editor}) => {
                  return editor.schema.node('paragraph');
            },
            command: ({ editor, range, command }) => {
                return command.setParagraph();
            },
        },
        {
            title: 'H1',
            icon: 'heading',
            canConvert: true,
            node: ({editor}) => {
                return editor.schema.node('heading', {level: 1});
            },
            command: ({ editor, range, command }) => {
                return command.setParagraph().setNode('heading', {level: 1});
            },
        },
        {
            title: 'H2',
            icon: 'heading',
            canConvert: true,
            node: ({editor}) => {
                return editor.schema.node('heading', {level: 2});
            },
            command: ({ editor, range, command }) => {
                return command.setParagraph().setNode('heading', {level: 2});
            },
        },
        {
            title: 'H3',
            icon: 'heading',
            canConvert: true,
            node: ({editor}) => {
                return editor.schema.node('heading', {level: 3});
            },
            command: ({ editor, range, command }) => {
                return command.setParagraph().setNode('heading', {level: 3});
            },
        },
        {
            title: 'Blockquote',
            icon: 'quote-left',
            canConvert: true,
            node: ({editor}) => {
                return editor.schema.node('blockquote', {}, [editor.schema.node('paragraph', {}, [])]);
            },
            command: ({ editor, range, command }) => {
                return command.setParagraph().setBlockquote();
            },
        },
        {
            title: 'Ordered List',
            icon: 'list-ol',
            canConvert: true,
            node: ({editor}) => {
                return editor.schema.node('orderedList', {}, [editor.schema.node('listItem', {}, [editor.schema.node('paragraph', {}, [])])]);
            },
            command: ({ editor, range, command }) => {
                return command.setParagraph().toggleOrderedList();
            },
        },
        {
            title: 'Unordered List',
            icon: 'list-ul',
            canConvert: true,
            node: ({editor}) => {
                return editor.schema.node('bulletList', {}, [editor.schema.node('listItem', {}, [editor.schema.node('paragraph', {}, [])])]);
            },
            command: ({ editor, range, command }) => {
                return command.setParagraph().toggleBulletList();
            },
        },
        {
            title: 'Horizontal Rule',
            icon: 'ruler-horizontal',
            canConvert: true,
            node: ({editor}) => {
                return editor.schema.node('horizontalRule');
            },
            command: ({ editor, range, command }) => {
                return command.setParagraph().setHorizontalRule();
            },
        },
        // {
        //     title: 'Bold',
        //     icon: 'bold',
        //     command: ({ editor, range }) => {
        //         editor
        //             .chain()
        //             .focus()
        //             .deleteRange(range)
        //             .setMark('bold')
        //             .run()
        //     },
        // },
        // {
        //     title: 'Italic',
        //     icon: 'italic',
        //     command: ({ editor, range }) => {
        //         editor
        //             .chain()
        //             .focus()
        //             .deleteRange(range)
        //             .setMark('italic')
        //             .run()
        //     },
        // },
        {
            title: 'Media',
            icon: 'photo-video',
            canConvert: false,
            node: ({editor}) => {
                return editor.schema.node('mediaItem');
            },
            command: ({ editor, range, command }) => {
                return command
                    .insertContent({
                        type: 'mediaItem'
                    });
            },
        },
        {
            title: 'Raw HTML',
            icon: 'code',
            canConvert: false,
            node: ({editor}) => {
                return editor.schema.node('rawHtml');
            },
            command: ({ editor, range, command}) => {
                return command
                    .insertContent({
                        type: 'rawHtml'
                    });
            },
        },
        {
            title: 'Grid Row',
            icon: 'th-large',
            canConvert: false,
            node: ({editor}) => {
                return editor.schema.node('gridRow');
            },
            command: ({ editor, range, command }) => {
               return command
                    .insertContent({
                        type: 'gridRow'
                    });
            },
        },
        {
            title: 'Partial',
            icon: 'puzzle-piece',
            canConvert: false,
            node: ({editor}) => {
                return editor.schema.node('partial');
            },
            command: ({ editor, range, command }) => {
                return command
                    .insertContent({
                        type: 'partial'
                    });
            },
        },
        {
            title: 'Link to Page',
            icon: 'file-alt',
            canConvert: false,
            node: ({editor}) => {
                return editor.schema.node('objectLink', { type: 'page', id: null, content: null});
            },
            command: ({ editor, range, command }) => {
                return command
                    .insertContent({
                        type: 'objectLink',
                        attrs: {
                            type: 'page', id: null, content: null
                        }
                    });
            },
        },
        {
            title: 'Link to Media',
            icon: 'file-image',
            canConvert: false,
            node: ({editor}) => {
                return editor.schema.node('objectLink', { type: 'media', id: null, content: null});
            },
            command: ({ editor, range, command }) => {
                return command
                    .insertContent({
                        type: 'objectLink',
                        attrs: {
                            type: 'media', id: null, content: null
                        }
                    });
            },
        },
    ];
    items = items.filter(item => item.title.toLowerCase().includes(query.toLowerCase()));
    if(canConvert) {
        items = items.filter(item => item.canConvert);
    }
    return items;
}