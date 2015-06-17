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

  // Subscribe to surahs collection
  Meteor.subscribe('surahs');
  Meteor.subscribe('deeds')
  Meteor.subscribe('reflections')

  // hook Bootstrap tooltip function
  $(function () {
    $('[data-toggle="tooltip"]').tooltip()
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
    // buddiesCount: function() {

    //   return Meteor.users.find({});
    // }
  });

  Template.surahPage.helpers({
    deeds: function() {
      return Deeds.find({surahId: this._id});
    }
  });

  Template.surahPage.events({
    'submit form.new-deed': function (e) {

      e.preventDefault();

      var $content = $(e.target).find('[name=content]');

      Deeds.insert({
        surahId: this._id,
        userId: Meteor.user()._id,
        submitted: new Date(),
        content: $content.val(),
        isPrivate: true
      });

      console.log(this._id + " " + Meteor.user().username + " " + $content.val());

      $content.val("");

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
    }
  });

  // submit a reflection
  Template.reflectionSubmit.events({
    'submit form.new-reflection': function (e, template) {
      // ...
      
      e.preventDefault();

      var user = Meteor.user();
      var surah = template.data._id;
      var $reflection = $(e.target).find('[name=reflection-content]');

      Reflections.insert({
        surahId : surah,
        body : $reflection.val(),
        userId : user._id,
        author: user.username,
        submitted: new Date()
      });
      

      console.log(user.username + " " + $reflection.val() + " " + template.data.title);
      
      $reflection.val("");

    }
  });
}

if (Meteor.isServer) {

  Meteor.startup(function () {
    // code to run on server at startup

    if (Surahs.find().count() === 0) {

      // fake quran buddies:
      var saadId = Meteor.users.insert({
        profile: {name: "Muhamad Saad"}
      });
      var saad = Meteor.users.findOne(saadId)

      var medriaId = Meteor.users.insert({
        profile: {name: "Medria Hardhienata"}
      });
      var medria = Meteor.users.findOne(medriaId)

      var firstId = Surahs.insert({
        day: 1,
        title: 'Al Fatiha - Al Baqarah',
        ayah: '1:1 - 2:141'
      });

      Deeds.insert({
        surahId: firstId,
        userId: saad._id,
        author: saad.profile.name,
        submitted: new Date(),
        content: 'Observing prayer deeper',
        isPrivate: true,
      });

      Deeds.insert({
        surahId: firstId,
        userId: medria._id,
        author: medria.profile.name,
        submitted: new Date(),
        content: 'Go to Mecca for doing Hajj, insyaAllah',
        isPrivate: false,
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
    return Deeds.find();
  });
  Meteor.publish('reflections', function() {
    return Reflections.find();
  });
}
