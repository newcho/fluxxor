---
title: Quick-Start Guide
template: page.ejs
---

Quick-Start Guide / Basic Todos Example
=======================================

Once you have Fluxxor and React [installed](/guides/installation.html), it's time to build an app! Since this guide is designed to cover the basics quickly, we'll start with a *very* basic todo app—namely, this one right here:

<div id="app"></div>

Stores and Actions
------------------

First, let's create a store to keep track of our todo items. It will respond to the following actions:

* `"ADD_TODO"` - adds a new todo
* `"TOGGLE_TODO"` - completes or uncompletes a specific todo item
* `"CLEAR_TODOS"` - removes all complete todo items

```javascript
var constants = {
  ADD_TODO: "ADD_TODO",
  TOGGLE_TODO: "TOGGLE_TODO",
  CLEAR_TODOS: "CLEAR_TODOS"
};

var TodoStore = Fluxxor.createStore({
  initialize: function() {
    this.todos = [];

    this.bindActions(
      constants.ADD_TODO, this.onAddTodo,
      constants.TOGGLE_TODO, this.onToggleTodo,
      constants.CLEAR_TODOS, this.onClearTodos
    );
  },

  onAddTodo: function(payload) {
    this.todos.push({text: payload.text, complete: false});
    this.emit("change");
  },

  onToggleTodo: function(payload) {
    payload.todo.complete = !payload.todo.complete;
    this.emit("change");
  },

  onClearTodos: function() {
    this.todos = this.todos.filter(function(todo) {
      return !todo.complete;
    });
    this.emit("change");
  },

  getState: function() {
    return {
      todos: this.todos
    };
  }
});
```

Let's create a few semantic actions to go along with our action types.

```javascript
var actions = {
  addTodo: function(text) {
    this.dispatch(constants.ADD_TODO, {text: text});
  },

  toggleTodo: function(todo) {
    this.dispatch(constants.TOGGLE_TODO, {todo: todo});
  },

  clearTodos: function() {
    this.dispatch(constants.CLEAR_TODOS);
  }
};
```

Now we can instantiate our store and build a `Flux` instance:

```javascript
var stores = {
  TodoStore: new TodoStore()
};

var flux = new Fluxxor.Flux(stores, actions);
```

Finally, let's use the `"dispatch"` event to add some logging:

```javascript
flux.on("dispatch", function(type, payload) {
  if (console && console.log) {
    console.log("[Dispatch]", type, payload);
  }
});
```

React Application
-----------------

Let's build out our UI with React. Don't forget `/** @jsx React.DOM */` at the top of the file if you're using JSX!

Our top-level `Application` component will use the [FluxMixin](/documentation/flux-mixin.html) as well as the [StoreWatchMixin](/documentation/store-watch-mixin.html) to make our lives a bit easier. The component will iterate over the array of todos and emit a `TodoItem` component for each one.

We'll also add a quick form for adding new todo items, and a button for clearing completed todos.

```javascript
var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var Application = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin("TodoStore")],

  getInitialState: function() {
    return { newTodoText: "" };
  },

  getStateFromFlux: function() {
    var flux = this.getFlux();
    // Our entire state is made up of the TodoStore data. In a larger
    // application, you will likely return data from multiple stores, e.g.:
    //
    //   return {
    //     todoData: flux.store("TodoStore").getState(),
    //     userData: flux.store("UserStore").getData(),
    //     fooBarData: flux.store("FooBarStore").someMoreData()
    //   };
    return flux.store("TodoStore").getState();
  },

  render: function() {
    return (
      <div>
        <ul>
          {this.state.todos.map(function(todo, i) {
            return <li key={i}><TodoItem todo={todo} /></li>;
          })}
        </ul>
        <form onSubmit={this.onSubmitForm}>
          <input type="text" size="30" placeholder="New Todo"
                 value={this.state.newTodoText}
                 onChange={this.handleTodoTextChange} />
          <input type="submit" value="Add Todo" />
        </form>
        <button onClick={this.clearCompletedTodos}>Clear Completed</button>
      </div>
    );
  },

  handleTodoTextChange: function(e) {
    this.setState({newTodoText: e.target.value});
  },

  onSubmitForm: function(e) {
    e.preventDefault();
    if (this.state.newTodoText.trim()) {
      this.getFlux().actions.addTodo(this.state.newTodoText);
      this.setState({newTodoText: ""});
    }
  },

  clearCompletedTodos: function(e) {
    this.getFlux().actions.clearTodos();
  }
});
```

The `TodoItem` component will display and style itself based on the completion of the todo, and will dispatch an action indicating its intent to toggle its completion state.

```javascript
var TodoItem = React.createClass({
  mixins: [FluxMixin],

  propTypes: {
    todo: React.PropTypes.object.isRequired
  },

  render: function() {
    var style = {
      textDecoration: this.props.todo.complete ? "line-through" : ""
    };

    return <span style={style} onClick={this.onClick}>{this.props.todo.text}</span>;
  },

  onClick: function() {
    this.getFlux().actions.toggleTodo(this.props.todo);
  }
});
```

Bringing it Together
--------------------

Now that we have a `Flux` instance and all our components are defined, we can finally render our app. We'll put it inside a `div` in our HTML with an ID of "app".

```javascript
React.renderComponent(<Application flux={flux} />, document.getElementById("app"));
```

And that's it! We've created a (super simple) Flux application with React and Fluxxor. You can find the full source code [on GitHub](https://github.com/BinaryMuse/fluxxor/tree/master/examples/todo-basic).

<script src="todo-bundle.js"></script>
