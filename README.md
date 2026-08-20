
```
TEDX-Damascus-Dashboard
├─ .eslintrc.cjs
├─ .idea
│  ├─ codeStyles
│  │  ├─ codeStyleConfig.xml
│  │  └─ Project.xml
│  ├─ dashboard.iml
│  ├─ inspectionProfiles
│  │  └─ Project_Default.xml
│  ├─ modules.xml
│  ├─ prettier.xml
│  └─ vcs.xml
├─ .prettierignore
├─ .prettierrc
├─ eslint.config.js
├─ index.html
├─ jsconfig.json
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ public
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ images
│  │  ├─ login-background.jpg
│  │  └─ tedx-logo.jpg
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ src
│  ├─ @mock-api
│  │  └─ index.js
│  ├─ app
│  │  ├─ App.jsx
│  │  ├─ auth
│  │  │  ├─ AuthContext.jsx
│  │  │  ├─ AuthGuard.jsx
│  │  │  ├─ PermissionGate.jsx
│  │  │  └─ store
│  │  │     └─ userSlice.js
│  │  ├─ configs
│  │  │  ├─ navigationConfig.js
│  │  │  ├─ routesConfig.jsx
│  │  │  └─ themeConfig.js
│  │  ├─ main
│  │  │  ├─ analytics-app
│  │  │  │  └─ AnalyticsApi.js
│  │  │  ├─ blog-app
│  │  │  │  ├─ blog-categories
│  │  │  │  │  ├─ BlogCategoriesApi.js
│  │  │  │  │  ├─ BlogCategoriesList.jsx
│  │  │  │  │  └─ BlogCategory.jsx
│  │  │  │  ├─ blog-detail
│  │  │  │  │  ├─ Blog.jsx
│  │  │  │  │  ├─ blogAuthorUtils.js
│  │  │  │  │  ├─ blogFontUtils.js
│  │  │  │  │  ├─ blogMapper.js
│  │  │  │  │  ├─ BlogView.jsx
│  │  │  │  │  ├─ models
│  │  │  │  │  │  └─ BlogModel.js
│  │  │  │  │  └─ tabs
│  │  │  │  │     ├─ AuthorSection.jsx
│  │  │  │  │     └─ BlogContentSeoTab.jsx
│  │  │  │  ├─ blogs-list
│  │  │  │  │  └─ BlogsList.jsx
│  │  │  │  ├─ BlogsApi.js
│  │  │  │  └─ BlogsAppConfig.jsx
│  │  │  ├─ dashboard
│  │  │  │  ├─ DashboardAppConfig.jsx
│  │  │  │  └─ DashboardPage.jsx
│  │  │  ├─ events-app
│  │  │  │  ├─ events-detail
│  │  │  │  │  ├─ Event.jsx
│  │  │  │  │  ├─ EventHeader.jsx
│  │  │  │  │  ├─ models
│  │  │  │  │  │  └─ events-model.js
│  │  │  │  │  └─ tabs
│  │  │  │  │     ├─ BasicInfoTab.jsx
│  │  │  │  │     └─ SocialLinksTab.jsx
│  │  │  │  ├─ events-list
│  │  │  │  │  ├─ EventsList.jsx
│  │  │  │  │  ├─ EventsListHeader.jsx
│  │  │  │  │  └─ EventsListTable.jsx
│  │  │  │  ├─ EventsApi.js
│  │  │  │  └─ EventsAppConfig.jsx
│  │  │  ├─ forms-app
│  │  │  │  ├─ form-submissions
│  │  │  │  │  ├─ FormSubmissionDetail.jsx
│  │  │  │  │  └─ FormSubmissions.jsx
│  │  │  │  ├─ forms-list
│  │  │  │  │  ├─ FormsList.jsx
│  │  │  │  │  ├─ FormsListHeader.jsx
│  │  │  │  │  └─ FormsListTable.jsx
│  │  │  │  ├─ FormsApi.js
│  │  │  │  └─ FormsAppConfig.jsx
│  │  │  ├─ home-settings-app
│  │  │  │  ├─ home-settings
│  │  │  │  │  └─ HomeSettingsPage.jsx
│  │  │  │  └─ HomeSettingsApi.js
│  │  │  ├─ not-found
│  │  │  │  └─ NotFoundPage.jsx
│  │  │  ├─ organizers-app
│  │  │  │  ├─ organizer-detail
│  │  │  │  │  ├─ models
│  │  │  │  │  │  └─ organizerModel.js
│  │  │  │  │  ├─ organizer.jsx
│  │  │  │  │  ├─ organizerHeader.jsx
│  │  │  │  │  └─ tabs
│  │  │  │  │     ├─ BasicInfoTab.jsx
│  │  │  │  │     └─ SocialLinksTab.jsx
│  │  │  │  ├─ organizers-list
│  │  │  │  │  ├─ organizersList.jsx
│  │  │  │  │  ├─ organizersListHeader.jsx
│  │  │  │  │  └─ organizersListTable.jsx
│  │  │  │  ├─ organizersApi.js
│  │  │  │  └─ organizersAppConfig.jsx
│  │  │  ├─ partners-app
│  │  │  │  ├─ customTiersSlice.js
│  │  │  │  ├─ partners-details
│  │  │  │  │  ├─ components
│  │  │  │  │  │  ├─ CustomTierField.jsx
│  │  │  │  │  │  └─ TierSizePicker.jsx
│  │  │  │  │  ├─ models
│  │  │  │  │  │  ├─ PartnerModel.js
│  │  │  │  │  │  └─ partnerTiers.js
│  │  │  │  │  ├─ Partner.jsx
│  │  │  │  │  ├─ PartnerHeader.jsx
│  │  │  │  │  └─ tabs
│  │  │  │  │     ├─ BasicInfoTab.jsx
│  │  │  │  │     ├─ ServicesTab.jsx
│  │  │  │  │     └─ SocialLinksTab.jsx
│  │  │  │  ├─ partners-list
│  │  │  │  │  ├─ PartnersList.jsx
│  │  │  │  │  ├─ PartnersListHeader.jsx
│  │  │  │  │  └─ PartnersListTable.jsx
│  │  │  │  ├─ PartnersApi.js
│  │  │  │  └─ PartnersAppConfig.jsx
│  │  │  ├─ sign-in
│  │  │  │  ├─ SignInConfig.jsx
│  │  │  │  └─ SignInPage.jsx
│  │  │  ├─ speakers-app
│  │  │  │  ├─ speaker-detail
│  │  │  │  │  ├─ models
│  │  │  │  │  │  └─ SpeakerModel.js
│  │  │  │  │  ├─ Speaker.jsx
│  │  │  │  │  ├─ SpeakerHeader.jsx
│  │  │  │  │  └─ tabs
│  │  │  │  │     ├─ BasicInfoTab.jsx
│  │  │  │  │     └─ SocialLinksTab.jsx
│  │  │  │  ├─ speakers-list
│  │  │  │  │  ├─ SpeakersList.jsx
│  │  │  │  │  ├─ SpeakersListHeader.jsx
│  │  │  │  │  └─ SpeakersListTable.jsx
│  │  │  │  ├─ SpeakersApi.js
│  │  │  │  └─ SpeakersAppConfig.jsx
│  │  │  ├─ storage
│  │  │  │  └─ StorageApi.js
│  │  │  ├─ team-app
│  │  │  │  ├─ team-details
│  │  │  │  │  ├─ models
│  │  │  │  │  │  └─ TeamMemberModel.js
│  │  │  │  │  ├─ tabs
│  │  │  │  │  │  ├─ BasicInfoTab.jsx
│  │  │  │  │  │  └─ SocialLinksTab.jsx
│  │  │  │  │  └─ TeamMember.jsx
│  │  │  │  ├─ team-list
│  │  │  │  │  ├─ TeamList.jsx
│  │  │  │  │  ├─ TeamListHeader.jsx
│  │  │  │  │  └─ TeamListTable.jsx
│  │  │  │  ├─ teamApi.js
│  │  │  │  └─ teamAppConfig.jsx
│  │  │  ├─ unauthorized
│  │  │  │  └─ UnauthorizedPage.jsx
│  │  │  ├─ users-app
│  │  │  │  ├─ user-detail
│  │  │  │  │  ├─ models
│  │  │  │  │  │  └─ UserModel.js
│  │  │  │  │  ├─ tabs
│  │  │  │  │  │  └─ BasicInfoTab.jsx
│  │  │  │  │  └─ User.jsx
│  │  │  │  ├─ users-list
│  │  │  │  │  ├─ UsersList.jsx
│  │  │  │  │  ├─ UsersListHeader.jsx
│  │  │  │  │  └─ UsersListTable.jsx
│  │  │  │  ├─ UsersApi.js
│  │  │  │  └─ UsersAppConfig.jsx
│  │  │  └─ wall-app
│  │  │     ├─ banned-words
│  │  │     │  └─ BannedWordsPage.jsx
│  │  │     ├─ wall-question
│  │  │     │  └─ WallQuestion.jsx
│  │  │     ├─ WallApi.js
│  │  │     ├─ WallAppConfig.jsx
│  │  │     └─ walls-list
│  │  │        ├─ WallList.jsx
│  │  │        ├─ WallListHeader.jsx
│  │  │        └─ WallListTable.jsx
│  │  ├─ providers
│  │  │  └─ IntlProviderWrapper.jsx
│  │  ├─ services
│  │  │  ├─ authService.js
│  │  │  ├─ axiosInstance.js
│  │  │  └─ tokenService.js
│  │  ├─ shared-components
│  │  │  ├─ breadcrumb
│  │  │  │  ├─ Breadcrumb.jsx
│  │  │  │  └─ index.js
│  │  │  ├─ confirm-modal
│  │  │  │  ├─ ConfirmModal.jsx
│  │  │  │  └─ index.js
│  │  │  ├─ custom-autocomplete
│  │  │  │  ├─ autocompleteSlice.js
│  │  │  │  ├─ autocompleteUtils.js
│  │  │  │  ├─ CustomAutocomplete.jsx
│  │  │  │  └─ index.js
│  │  │  ├─ custom-table
│  │  │  │  ├─ CustomTable.jsx
│  │  │  │  ├─ index.js
│  │  │  │  ├─ tableSlice.js
│  │  │  │  └─ useTableState.js
│  │  │  ├─ Dialog
│  │  │  │  ├─ Dialog.jsx
│  │  │  │  └─ DialogProvider.jsx
│  │  │  ├─ filter-icon
│  │  │  │  └─ FilterIcon.jsx
│  │  │  ├─ image-picker
│  │  │  │  ├─ ImagePickerDialog.jsx
│  │  │  │  ├─ ImagePickerField.jsx
│  │  │  │  ├─ index.js
│  │  │  │  └─ mediaRefUtils.js
│  │  │  ├─ loading-spinner
│  │  │  │  ├─ index.js
│  │  │  │  └─ LoadingSpinner.jsx
│  │  │  ├─ locale-input
│  │  │  │  ├─ index.js
│  │  │  │  ├─ LocaleInput.jsx
│  │  │  │  ├─ translations.js
│  │  │  │  └─ utils.js
│  │  │  ├─ locale-switcher
│  │  │  │  ├─ index.js
│  │  │  │  └─ LocaleSwitcher.jsx
│  │  │  ├─ page-layout
│  │  │  │  ├─ index.js
│  │  │  │  └─ PageLayout.jsx
│  │  │  ├─ rich-text-editor
│  │  │  │  ├─ fontFamilies.js
│  │  │  │  ├─ FontSize.js
│  │  │  │  ├─ imageAlignPlugin.js
│  │  │  │  ├─ imageAlignUtils.js
│  │  │  │  ├─ imageNodeUtils.js
│  │  │  │  ├─ ImageToolbar.jsx
│  │  │  │  ├─ index.js
│  │  │  │  ├─ ResizableImage.js
│  │  │  │  ├─ RichTextContent.jsx
│  │  │  │  ├─ RichTextEditor.jsx
│  │  │  │  ├─ ToolbarTooltip.jsx
│  │  │  │  ├─ UrlInputDialog.jsx
│  │  │  │  └─ urlUtils.js
│  │  │  ├─ status-badge
│  │  │  │  ├─ index.js
│  │  │  │  └─ StatusBadge.jsx
│  │  │  └─ wysiwyg-editor
│  │  │     └─ WYSIWYGEditor.jsx
│  │  ├─ store
│  │  │  ├─ apiService.js
│  │  │  ├─ index.js
│  │  │  ├─ localeSlice.js
│  │  │  └─ store.js
│  │  └─ theme-layouts
│  │     ├─ AuthLayout
│  │     │  └─ AuthLayout.jsx
│  │     └─ MainLayout
│  │        ├─ Header.jsx
│  │        ├─ MainLayout.jsx
│  │        └─ Sidebar.jsx
│  ├─ assets
│  │  └─ img
│  │     └─ no-section.png
│  ├─ index.css
│  ├─ locales
│  │  ├─ ar.js
│  │  ├─ en.js
│  │  └─ index.js
│  ├─ main.jsx
│  ├─ styles
│  │  └─ index.css
│  └─ utils
│     └─ helpers.js
├─ tailwind.config.js
├─ vercel.json
└─ vite.config.js

```