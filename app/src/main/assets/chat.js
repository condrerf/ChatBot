(function(win, doc) {

  "use strict";

  win.App = win.App || {};

})(this, document);
$(function() {
  (function(win, doc, ns) {

    "use strict";

    function EventDispatcher() {
      this._events = {};
    }

    EventDispatcher.prototype.hasEventListener = function(eventName) {
      return !!this._events[eventName];
    };

    EventDispatcher.prototype.addEventListener = function(eventName, callback) {
      if (this.hasEventListener(eventName)) {
        var events = this._events[eventName],
            length = events.length,
            i = 0;

        for (; i < length; i++) {
          if (events[i] === callback) {
            return;
          }
        }

        events.push(callback);
      } else {
        this._events[eventName] = [callback];
      }
    };

    EventDispatcher.prototype.removeEventListener = function(eventName, callback) {
      if (!this.hasEventListener(eventName)) {
        return;
      } else {
        var events = this._events[eventName],
            i = events.length,
            index;

        while (i--) {
          if (events[i] === callback) {
            index = i;
          }
        }

        events.splice(index, 1);
      }
    };

    EventDispatcher.prototype.fireEvent = function(eventName, opt_this, opt_arg) {
      if (!this.hasEventListener(eventName)) {
        return;
      } else {
        var events     = this._events[eventName],
            copyEvents = _copyArray(events),
            arg        = _copyArray(arguments),
            length     = events.length,
            i = 0;

        // eventNameとopt_thisを削除
        arg.splice(0, 2);

        for (; i < length; i++) {
          copyEvents[i].apply(opt_this || this, arg);
        }
      }

      function _copyArray(array) {
        var newArray = [],
            i = 0;

        try {
          newArray = [].slice.call(array);
        } catch(e) {
          for (; i < array.length; i++) {
            newArray.push(array[i]);
          }
        }

        return newArray;
      }
    };

    ns.EventDispatcher = EventDispatcher;

  })(this, document, App);
  (function(win, doc, $, ns) {

    "use strict";

    var instance, originalConstructor;

    function MessageList() {
      var that = this;

      _init();

      function _init() {
        ns.EventDispatcher.call(that);
      }

      this.him = [
        "hello world."
      ];
    }

    originalConstructor = MessageList.prototype.constructor;
    MessageList.prototype = new ns.EventDispatcher();
    MessageList.prototype.constructor = originalConstructor;
    originalConstructor = null;

    MessageList.getInstance = function() {
      if (!instance) {
        instance = new MessageList();
      }

      return instance;
    };

    ns.MessageList = MessageList;

  })(this, document, $, App);
  (function(win, doc, $, ns) {

    "use strict";

    var instance, originalConstructor;
	var key = "sample";
	var url = "https://chatbot-api.userlocal.jp/api/chat";
    var messageOnError = "ごめんなさい、よく聞こえませんでした";
//	var firstMessageArray = ["こんにちは", "調子はどう？", "元気してる？"];
//	var firstMessageId = Math.floor(Math.random() * firstMessageArray.length);
//	var firstMessage = firstMessageArray[firstMessageId];
	var dialectArray = ["っしょ", "だべ", "どす", "だす", "じゃ", "っちゃ", "たい", "ばい"];
	var dialectId = Math.floor(Math.random() * dialectArray.length);
	var dialect = dialectArray[dialectId];
	var messageOnErrorArray = ["ごめんなさい、よく聞こえませんでした", "ネットに接続できていないと聞き取れないんです", "ネットの接続確認をお願いします"];

    function MessageManager() {
      var messageList = ns.MessageList.getInstance();

      var that        = this,
          historyList = [],
          index = 0,
          LOOP_INDEX = 1;

      _init();

      function _init() {
        ns.EventDispatcher.call(that);

//        var msg = new ns.Message(firstMessage, false);
//
//        msg.addEventListener("POST", _handlePost);
//        historyList.push(msg);
//
//        if (!!messageList.him[index + 1]) {
//          ++index;
//        } else {
//          index = messageList.him.length - LOOP_INDEX;
//        }
      }

      function _handlePost(evt) {
        var interval = 500 + Math.random() * 1000 | 0;

        that.fireEvent("POST", evt, evt);

        if (evt.target === "mine") {
          setTimeout(function() {
            receive();
          }, interval);
        }
      }

      function send(txt) {
        if (!txt) {
          return;
        }

        var msg = new ns.Message(txt, true);

        msg.addEventListener("POST", _handlePost);
        historyList.push(msg);
      }

      function receive() {
        var sendedMessage = historyList[historyList.length-1].txt;
		var param = {
				key: key,
				message: sendedMessage,
			};

		$.ajax({
		    url:url,
		    type: "GET",
		    data: param,
		    cache:false,
		    success: function(data) {
				var m = messageList.him[index];
				
				if (data.responseText !== "undefined") {
			    	var ary = $.parseHTML(data.responseText);
			    	if (ary.length > 0) {
			    		var json = JSON.parse(ary[0].textContent);
						if (json.status == "success") {
							m = json.result;
							if ($("input[name=dialect_flg]:checked").val() == "1") {
								m += dialect;
							}
						}
			    	}
				}

				var msg = new ns.Message(m, false);

				msg.addEventListener("POST", _handlePost);
				historyList.push(msg);

				if (!!messageList.him[index + 1]) {
					++index;
				} else {
					index = messageList.him.length - LOOP_INDEX;
				}
		    },
			error: function(xhr, status, err) {
				var messageOnErrorId = Math.floor(Math.random() * messageOnErrorArray.length);
				var messageOnError = messageOnErrorArray[messageOnErrorId];
				var msg = new ns.Message(messageOnError, false);

				msg.addEventListener("POST", _handlePost);
				historyList.push(msg);

				if (!!messageList.him[index + 1]) {
					++index;
				} else {
					index = messageList.him.length - LOOP_INDEX;
				}
			}
		});
      }

      this.send = send;
    }

    originalConstructor = MessageManager.prototype.constructor;
    MessageManager.prototype = new ns.EventDispatcher();
    MessageManager.prototype.constructor = originalConstructor;
    originalConstructor = null;

    MessageManager.getInstance = function() {
      if (!instance) {
        instance = new MessageManager();
      }

      return instance;
    };

    ns.MessageManager = MessageManager;

  })(this, document, $, App);
  (function(win, doc, $, ns) {

    "use strict";

    var $stage = $("#global-stage"),
        $inner = $stage.find("#global-stage-inner"),
        originalConstructor;

    function Message(txt, isMine) {
      if (!txt) {
        return;
      }

      var that  = this,
          klass = isMine ? "invisble msg mine" : "invisble msg",
          $msg  = $('<div class="' + klass + '"><p class="txt">' + txt + '</p></div>');

      _init();

      function _init() {
        ns.EventDispatcher.call(that);

        $inner.append($msg);
        $stage.animate({scrollTop: $inner.height()}, 200);

        setTimeout(function() {
          $msg.removeClass("invisble");
          that.fireEvent("POST", that, that);
        }, 100);
      }

      that.txt    = txt;
      that.target = isMine ? "mine" : "him";
    }

    originalConstructor = Message.prototype.constructor;
    Message.prototype = new ns.EventDispatcher();
    Message.prototype.constructor = originalConstructor;
    originalConstructor = null;

    ns.Message = Message;

  })(this, document, $, App);
  (function(win, doc, $, ns) {

    "use strict";

    var messageManager = ns.MessageManager.getInstance(),
        $form = $("#global-footer-form"),
        $txt  = $("#global-footer-form-txt");

    $form.submit(handleSubmit);

    function handleSubmit(e) {
      e.stopPropagation();
      e.preventDefault();

      messageManager.send($txt.val(), true);

      $txt.val("");

      return false;
    }

  })(this, document, $, App);
});
