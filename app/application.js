/**
 * Created by andy on 2017/6/21.
 */
jQuery(function ($) {
    window.App = Spine.Controller.create({
        el: $("body"),
        elements: {
            "#sidebar": "sidebarEl",
            "#contacts": "contactsEl"
        },
        init: function () {
            this.sidebar = Sidebar.init({el: this.sidebarEl});
            this.contact = Contacts.init({el: this.contactsEl});
            //从本地存储中获取联系人
            Contact.fetch();
        }
    }).init();
});
