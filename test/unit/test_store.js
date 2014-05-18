var Fluxbox = require("../../");

var chai = require("chai"),
    expect = chai.expect,
    sinon = require("sinon"),
    sinonChai = require("sinon-chai");

chai.use(sinonChai);

describe("Store", function() {
  it("passes one object from constructor to initialize", function(done) {
    var Store = Fluxbox.createStore({
      initialize: function(opt, nothing) {
        expect(opt).to.equal(42);
        expect(nothing).to.be.undefined;
        done();
      }
    });
    new Store(42, 100);
  });

  it("allows registering actions via an actions hash", function() {
    var Store = Fluxbox.createStore({
      actions: {
        "ACTION": "handleAction"
      },

      handleAction: function() {}
    });
    var store = new Store();
    store.handleAction = sinon.spy();
    var payload = {val: 42};
    store.__handleAction__({type: "ACTION", payload: payload});
    expect(store.handleAction).to.have.been.calledWith(payload, "ACTION");
  });

  it("allows registering actions via bindActions", function() {
    // also tests that methods are autobound to the store instance
    var Store = Fluxbox.createStore({
      actions: {
        "ACTION": "handleAction"
      },

      initialize: function() {
        this.bindActions("ACTION2", "handleAction2",
                         "ACTION3", this.handleAction3)
      },

      handleAction: function() {},
      handleAction2: function() {},
      handleAction3: function() {
        this.value = 42;
      },
    });
    var store = new Store();
    store.handleAction = sinon.spy();
    store.handleAction2 = sinon.spy();
    var payload = {val: 42};
    store.__handleAction__({type: "ACTION", payload: payload});
    expect(store.handleAction).to.have.been.calledWith(payload, "ACTION");
    store.__handleAction__({type: "ACTION2", payload: payload});
    expect(store.handleAction2).to.have.been.calledWith(payload, "ACTION2");
    store.__handleAction__({type: "ACTION3", payload: payload});
    expect(store.value).to.equal(42);
  });
});
