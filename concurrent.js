tx.requireUser = false;

var Documents = new Mongo.Collection("documents");

if (Meteor.isClient) {
    Router.route("/", function() {
        this.render("main");
    });

    Template.main.helpers({
        allDocs: function() {
            return Documents.find().fetch();
        }
    });

    Template.main.events({
        "click #run_concurrent_txns": function() {
            document.getElementById("fa").contentWindow.insertDocuments();
            document.getElementById("fb").contentWindow.insertDocuments();
        },
        "click #undo": function() {
            tx.undo();
        }
    });

    var client_id;  // used only on client
    Router.route("/:client_id", function() {
        this.render("one_client", {data: {client_id: this.params.client_id}});
        client_id = this.params.client_id;
    });

    Template.one_client.events({
        "click #run_txn": function() {
            window.insertDocuments();
        }
    });

    window.insertDocuments = function() {
        Meteor.call("insertDocuments", client_id);
    };
}

if (Meteor.isServer) {
    Meteor.methods({
        insertDocuments: function(client_id) {
            console.log(`client ${client_id}: tx.start begin`);
            tx.start();
            console.log(`client ${client_id}: tx.start end`);
            var pfx = Random.id();
            for (var i = 0; i < 10; i++) {
                var id = client_id + "_" + pfx + "_" + i;
                Documents.insert({_id: id}, {tx: true});
            }
            console.log(`client ${client_id}: tx.commit begin`);
            tx.commit();
            console.log(`client ${client_id}: tx.commit end`);
        }
    });
}
