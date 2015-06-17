// Collections
Surahs = new Mongo.Collection('surahs');
Reflections = new Mongo.Collection('reflections');
Deeds = new Mongo.Collection('deeds');

// Router
Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  waitOn: function() { return Meteor.subscribe('surahs'); }
});

Router.route('/', { name: 'surahList' });
Router.route('/surah/:_id', {
  name: 'surahPage',
  data: function() { return Surahs.findOne(this.params._id); }
});
Router.onBeforeAction('dataNotFound', {only: 'postPage'});

if (Meteor.isClient) {

  
  Session.set('isInfoRead', false);
  

  // Subscribe to surahs collection
  Meteor.subscribe('surahs');
  Meteor.subscribe('deeds')
  Meteor.subscribe('reflections')

  // hook Bootstrap tooltip function
  $(function () {
    $('[data-toggle="tooltip"]').tooltip();
  });

  // Accounts helpers
  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_AND_EMAIL'
  });

  // surah list helper
  Template.surahList.helpers({
    surahs: function () {
      // return array of surah
      return Surahs.find();
    }
  });

  Template.surahItem.helpers({
    deedsCount: function() {
      return Deeds.find({surahId: this._id}).count();
    },
    reflectionsCount: function() {
      return Reflections.find({surahId: this._id}).count();
    },
    // buddiesCount: function() {

    //   return Meteor.users.find({});
    // }
  });

  Template.surahPage.helpers({
    deeds: function() {
      return Deeds.find({surahId: this._id}, {sort: {submitted: -1}});
    },
    anyReflections: function() {
      return Reflections.find({surahId: this._id}).count() > 0 ? true : false;
    }, 
    anyDeeds: function() {
      return Deeds.find({surahId: this._id}).count() > 0 ? true : false;
    }
  });

  Template.surahPage.events({
    'submit form.new-deed': function (e) {

      e.preventDefault();

      // get the deed content and surah Id which this deed attach to
      var content = $(e.target).find('[name=content]').val();
      var surahId = this._id;

      // create new deed by calling createNewDeed function
      Meteor.call('createNewDeed', content, surahId);

      // clear the text form field
      $(e.target).find('[name=content]').val("");

    },
    'click .deeds-info': function () {
      $('#deeds-info').modal('show');
    }
  });

  Template.reflectionsList.helpers({
    reflections: function() {
      return Reflections.find({surahId: this._id});
    }
  });

  Template.reflectionItem.helpers({
    submittedText: function () {
      return moment(this.submitted).fromNow();
    },
    isOwner: function() {
      return this.userId === Meteor.userId();
    },
    // isNotOwner: function() {
    //   return this.userId === Meteor.userId();
    // },
    isEditing: function() {
      return this.edited && this.userId === Meteor.userId();
    }
  });

  Template.reflectionItem.events({
    'click .remove-reflection': function () {
      Session.set('currentReflection', this._id);
      $('#remove-reflection-modal').modal('show');
    },
    'click .toggle-private': function () {
      Meteor.call('setPrivate', this._id, !this.isPublic);
    },
    'click .edit-reflection': function() {
      Meteor.call('setEditing', this._id, !this.edited);
    },
    'click .save-reflection': function() {
      var refContent = $("#edit-reflection").val();
      Meteor.call('saveReflection', this._id, refContent);
    },
    'click .discard-reflection': function() {
      var refContent = $("#edit-reflection").val("");
      Meteor.call('setEditing', this._id, false);
    },
    'click .like': function() {
      Meteor.call('liked', this._id)
    }
  });

  Template.removeReflection.events({
    'click .yes-remove': function () {
      // ...
      var thisReflection = Session.get('currentReflection');
      Meteor.call('removeReflection', thisReflection);

      $('#remove-reflection-modal').modal('hide');

    }
  });

  // submit a reflection
  Template.reflectionSubmit.events({
    'submit form.new-reflection': function (e, template) {
      // ...
      
      e.preventDefault();

      var surah = template.data._id;
      var reflection = $(e.target).find('[name=reflection-content]').val();

      // create new reflection
      Meteor.call('createNewReflection', surah, reflection);
      
      $(e.target).find('[name=reflection-content]').val("");

    },
    'click .cancel-submit': function () {
      $("#input-reflection").val("");
    }

  });

  Template.deedItem.helpers({
    isOwner: function() {
      return this.userId === Meteor.userId();
    }
  });

  Template.deedItem.events({
    'click .remove-deed': function () {
      Session.set('currentDeed', this._id);
      $('#remove-deed-modal').modal('show');
    },
    'click .toggle-private': function () {
      Meteor.call('toggleDeedPrivacy', this._id, !this.isPrivate);
    },
    'click .like-deed': function() {
      Meteor.call('likeDeed', this._id)
    }
  });

  Template.removeDeed.events({
    'click .yes-remove': function () {
      // ...
      var thisDeed = Session.get('currentDeed');
      Meteor.call('removeDeed', thisDeed);

      $('#remove-deed-modal').modal('hide');

    }
  });

  Template.firstInfo.helpers({
    isNotRead: function () {
      // ...
      return !Session.get('isInfoRead');
    }
  });

  Template.firstInfo.events({
    'click .close': function () {
      Session.setPersistent('isInfoRead', true);
    }
  });
}

if (Meteor.isServer) {

  Meteor.startup(function () {
    // code to run on server at startup

    if (Surahs.find().count() === 0) {

      Surahs.insert({
        day: 1,
        title: 'Al Fatiha - Al Baqarah',
        ayah: '1:1 - 2:141'
      });

      Surahs.insert({
        day: 2,
        title: 'Al Baqarah - Al Baqarah',
        ayah: '2:142 - 2:252'
      });

      Surahs.insert({
        day: 3,
        title: 'Al Baqarah - Ali Imran',
        ayah: '2:253 - 3:92'
      });

      Surahs.insert({
        day: 4,
        title: 'Ali Imran - An Nisaa',
        ayah: '3:93 - 4:23'
      });

      Surahs.insert({
        day: 5,
        title: 'An Nisaa - An Nisaa',
        ayah: '4:24 - 4:147'
      });
      
      Surahs.insert({
        day: 6,
        title: 'An Nisaa - Al Maaidah',
        ayah: '4:148 - 5:81'
      });

      Surahs.insert({
        day: 7,
        title: 'Al Maaidah - Al An\'aam',
        ayah: '5:82 - 6:110'
      });

      Surahs.insert({
        day: 8,
        title: 'Al An\'aam - Al\'Araaf',
        ayah: '6:111 - 7:87'
      });

      Surahs.insert({
        day: 9,
        title: 'Al\'Araaf - Al Anfaal',
        ayah: '7:88 - 8:40'
      });

      Surahs.insert({
        day: 10,
        title: 'Al Anfaal - At Tauba',
        ayah: '8:41 - 9:92'
      });

      Surahs.insert({
        day: 11,
        title: 'At Tauba - Huud',
        ayah: '9:93 - 11:5'
      });

      Surahs.insert({
        day: 12,
        title: 'Huud - Yusuf',
        ayah: '11:6 - 12:52'
      });

      Surahs.insert({
        day: 13,
        title: 'Yusuf - Ibrahim',
        ayah: '12:53 - 14:52'
      });

      Surahs.insert({
        day: 14,
        title: 'Al Hijr - An Nahl',
        ayah: '15:1 - 16:128'
      });

      Surahs.insert({
        day: 15,
        title: 'Al Isra - Al Kahf',
        ayah: '17:1 - 18:74'
      });

      Surahs.insert({
        day: 16,
        title: 'Al Kahf - Ta Ha',
        ayah: '18:75 - 20:135'
      });

      Surahs.insert({
        day: 17,
        title: 'Al Anbiyaa - Al Hajj',
        ayah: '21:1 - 22:78'
      });

      Surahs.insert({
        day: 18,
        title: 'Al Mu\'minun - Al Furqan',
        ayah: '23:1 - 25:20'
      });

      Surahs.insert({
        day: 19,
        title: 'Al Furqan - An Naml',
        ayah: '25:21 - 27:55'
      });

      Surahs.insert({
        day: 20,
        title: 'An Naml - Al Ankabut',
        ayah: '27:56 - 29:45'
      });
      
      Surahs.insert({
        day: 21,
        title: 'Al Ankabut - Al Ahzab',
        ayah: '29:46 - 33:30'
      });

      Surahs.insert({
        day: 22,
        title: 'Al Ahzab - Ya Siin',
        ayah: '33:31 - 36:27'
      });

      Surahs.insert({
        day: 23,
        title: 'Ya Siin - Az Zumar',
        ayah: '36:28 - 39:31'
      });

      Surahs.insert({
        day: 24,
        title: 'Az Zumar - Fussilat',
        ayah: '39:32 -41:46'
      });

      Surahs.insert({
        day: 25,
        title: 'Fussilat - Al Jathiya',
        ayah: '41:47 - 45:37'
      });

      Surahs.insert({
        day: 26,
        title: 'Al Ahqaf - Az Zariyat',
        ayah: '45:1 - 51:30'
      });

      Surahs.insert({
        day: 27,
        title: 'Az Zariyat - Al Hadid',
        ayah: '51:31 - 57:29'
      });

      Surahs.insert({
        day: 28,
        title: 'Al Mujadila - At Tahrim',
        ayah: '58:1 - 66:12'
      });

      Surahs.insert({
        day: 29,
        title: 'Al Mulk - Al Mursalat',
        ayah: '67:1 - 77:50'
      });

      Surahs.insert({
        day: 30,
        title: 'An Nabaa - An Nas',
        ayah: '78:1 - 114:6'
      });
    }

  });

  // Publish collections
  Meteor.publish('surahs', function() {
    return Surahs.find();
  });
  Meteor.publish('deeds', function() {
    return Deeds.find({
      $or: [
        {isPrivate: {$ne: true}},
        {userId: this.userId}
      ]
    });
  });
  Meteor.publish('reflections', function() {
    return Reflections.find({
      $or: [
        {isPublic: {$ne: false}},
        {userId: this.userId}
      ]
    });
  });

  Meteor.methods({
    createNewDeed: function (content, surahId) {
      // get current user
      var currentUserId = Meteor.user();

      // insert new deed
      Deeds.insert({
        surahId: surahId,
        userId: currentUserId._id,
        submitted: new Date(),
        content: content,
        isPrivate: true,
        liked: 0
      });
    },
    createNewReflection: function (surah, reflection) {
      // get current user
      var currentUserId = Meteor.user();

      console.log(currentUserId.username);

      // create new reflection
      Reflections.insert({
        surahId : surah,
        userId : currentUserId._id,
        author: currentUserId.username,
        submitted: new Date(),
        body : reflection,
        isPublic: true,
        liked: 0,
        edited: false
      });
    },
    removeReflection: function(reflection) {
      Reflections.remove(reflection);
    },
    setPrivate: function (reflectionId, setToPrivate) {
      var reflection = Reflections.findOne(reflectionId);

      if (reflection.userId !== Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
      }

      Reflections.update(reflectionId, {$set: {isPublic: setToPrivate}});
    },
    setEditing: function(reflectionId, setToEditing) {
      var reflection = Reflections.findOne(reflectionId);
      if (reflection.userId !== Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
      }

      Reflections.update(reflectionId, {$set: {edited: setToEditing}});
    },
    saveReflection: function(reflectionId, newContent) {
      var reflection = Reflections.findOne(reflectionId);
      if (reflection.userId !== Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
      }
      Reflections.update(reflectionId, {$set: {body: newContent}});
      Meteor.call('setEditing', reflectionId, false);
    },
    liked: function(reflectionId) {
      Reflections.update(reflectionId, {$inc: {liked: 1}});
    },
    removeDeed: function(deedId) {
      Deeds.remove(deedId);
    },
    toggleDeedPrivacy: function (deedId, togglePrivacy) {
      var deed = Deeds.findOne(deedId);

      if (deed.userId !== Meteor.userId()) {
        throw new Meteor.Error("not-authorized");
      }

      Deeds.update(deedId, {$set: {isPrivate: togglePrivacy}});
    },
    likeDeed: function(deedId) {
      Deeds.update(deedId, {$inc: {liked: 1}});
    }
  });
}
