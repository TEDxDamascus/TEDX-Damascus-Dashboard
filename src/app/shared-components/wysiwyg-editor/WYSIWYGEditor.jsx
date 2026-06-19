import { forwardRef, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const WYSIWYGEditor = forwardRef(({ onChange, value, placeholder, onSizeChange }, _ref) => {
  const editorRef = useRef();

  const init = {
    placeholder,
    plugins: [
      'advlist autolink link image lists charmap hr anchor pagebreak',
      'autoresize',
      'searchreplace wordcount visualblocks visualchars insertdatetime media nonbreaking',
      'table directionality emoticons code',
    ],
    toolbar1:
      'undo redo | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | styleselect',
    toolbar2: 'link unlink anchor | image media | forecolor backcolor | code',
    image_advtab: true,
    image_title: true,
    automatic_uploads: true,
    paste_data_images: true,
    file_picker_types: 'image',
    file_picker_callback(cb, _value, _meta) {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.onchange = function () {
        const file = this.files[0];
        const reader = new FileReader();
        reader.onload = function () {
          const id = 'blobid' + new Date().getTime();
          const blobCache = window.tinymce.activeEditor.editorUpload.blobCache;
          const blobInfo = blobCache.create(id, file, reader.result);
          blobCache.add(blobInfo);
          cb(blobInfo.blobUri(), { title: file.name });
        };
        reader.readAsDataURL(file);
      };
      input.click();
    },
    setup(editor) {
      editor.on('ResizeEditor', () => onSizeChange?.());
    },
  };

  return (
    <Editor
      tinymceScriptSrc="/assets/tinymce/tinymce.min.js"
      init={init}
      value={value}
      onEditorChange={(html) => onChange(html)}
      onInit={(_, editor) => {
        editorRef.current = editor;
        onSizeChange?.();
      }}
    />
  );
});

WYSIWYGEditor.displayName = 'WYSIWYGEditor';

export default WYSIWYGEditor;
