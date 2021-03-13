//用户名是superatc 密码是axy123114
var loginAction = (function(doc) {
	var oModal = doc.getElementsByClassName('js_modal')[0],
			submitURL = doc.getElementById('js_loginForm').action,
			oUserName = doc.getElementById('js_username'),
			oPassword = doc.getElementById('js_password'),
			oErrorTip = document.getElementsByClassName('js_errorTip')[0],
			oPersistedLogin = doc.getElementById('js_persistedLogin'),
			oLoginStatus = doc.getElementsByClassName('js_loginStatus')[0],

			loginTpl = doc.getElementById('js_loginTpl').innerHTML,
	    userTpl = doc.getElementById('js_userTpl').innerHTML;

	return {
		openLoginBoard: function(show) {
			if(show) {
				oModal.className += ' show';
			}else {
				oModal.className = 'modal-container js_modal';
			}
		},

		login: function(e) {
			var e = e || window.event;
			e.preventDefault();

			var username = trimSpace(oUserName.value),
					password = trimSpace(oPassword.value);

			if(username.length < 6 || username.length > 20) {
				oErrorTip.innerText = '用户名长度： 6-20位';
				return;
			}else {
				oErrorTip.innerText = '';
			}

			if(password.length < 6 || password.length > 20) {
				oErrorTip.innerText = '密码长度： 6-20位';
				return;
			}else {
				oErrorTip.innerText = '';
			}

			this.submitForm(username, password, oPersistedLogin.checked);

		},

		submitForm: function(username, password, isPersistedLogin) {
			xhr.ajax({
				url: submitURL,
				type: 'POST',
				dataType: 'JSON',
				data: {
					username: username,
					password: password,
					isPersistedLogin: isPersistedLogin
				},
				success: function(data) {
					var code = data.error_code,
							errorInfo = '';

					switch(code) {
						case '1001': 
							errorInfo = '用户名长度不正确';
							break;
						case '1002':
							errorInfo = '密码长度不正确';
							break;
						case '1003':
              errorInfo = '此用户名不存在';
              break;
            case '1004':
              errorInfo = '密码不正确';
              break;
            case '1005':
              errorInfo = '登录失败，请重新登录';
              break;
            case '200':
              location.reload();
              break;
            default:
              break;
          }

          oErrorTip.innerHTML = errorInfo;
				}
		  });
		},

		checkAuth: function() {
			var _self = this;

			manageCookies.get('auth', function(cookie) {
				if(cookie != undefined) {
					xhr.ajax({
						url: 'http://localhost/api_for_study/User/checkAuth',
						type: 'POST',
						dataType: 'JSON',
						data: {
							auth: cookie
						},
						success: function(data) {
							var code = data.error_code,
									errorInfo = '';
							switch(code) {
								case '1006':
									errorInfo = '登陆验证不通过，请重试';
									_self.openLoginBoard(true);
									_self.render(false);
									break;
								case '1007':
									errorInfo = '登陆已过期，请重试';
									_self.openLoginBoard(true);
									_self.render(false);
									break;
			          case '200':
			            _self.render(true);
			            break;
			          default:
			            break;
			        }
						}
					});
				}
			})
		},

		render: function(isLogin) {
			if(isLogin) {
				manageCookies.get('nickname', function(cookie) {
					oLoginStatus.innerHTML = userTpl.replace(/{{(.*?)}}/g, cookie);
				});
			}else {
				oLoginStatus.innerHTML = loginTpl;
			}
		}
	};
})(document);

;(function(doc) {

	var oOpenBtn = doc.getElementsByClassName('js_openBtn')[0],
			oCloseBtn = doc.getElementsByClassName('js_closeBtn')[0],
			oLoginBtn = doc.getElementsByClassName('js-loginBtn')[0];

	var init = function() {
		loginAction.checkAuth.call(loginAction);
		bindEvent();
	}

	function bindEvent() {
		oOpenBtn.addEventListener('click', loginAction.openLoginBoard.bind(null, true), false);
		oCloseBtn.addEventListener('click', loginAction.openLoginBoard.bind(null, false), false);
		oLoginBtn.addEventListener('click', loginAction.login.bind(loginAction), false);
	}

	init();
})(document);