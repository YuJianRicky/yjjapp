﻿
var $window = $(window),
	$body = $('body'),
	$navbar = $body.find('#navbar'),
	$frame = $body.find('#frame'),
	hostUrl = 'http://yjjapp.duapp.com',
	pageSize = 10,	// same as config
	clientType = '', hashPage = '';

// 禁用缓存
$.ajaxSetup({
	cache: false
});

// ajax-form
$.fn.ajaxForm = function(options) {
	return $(this).each(function(i, el) {
		var $form = $(el);
		$form.on('submit', function(ev) {
			ev.preventDefault();
			ajax(_.extend({
				url: $form.attr('action'),
				type: $form.attr('method'),
				data: _.extend($form.serializeJSON(), options.data)
			}, options));
		});
	});
}

// hash改变时自动加载子页面
$(window).on('hashchange', function(event) {
	event.preventDefault();
	if (window.location.hash === hashPage) return;
	loadFrame(window.location.hash);
});

// 绑定链接
$body.delegate('[href]:not(.ex-link)', 'click', function(event) {
	event.preventDefault();
	var href = $(this).attr('href');
	if (href && href !== '#') loadFrame(href);
}).delegate('form a[type="submit"]', 'click', function() {	// enable a[type="submit"]
	$(this).closest('form').submit();
});

// local ajax method
function ajax(options) {
	options.success = (function(fn){
		return function(res){
			if (typeof res !== 'object')
				res = $.parseJSON(res);
			var ok = res['ok'], msg = res['msg'];
			if (msg) notify(msg, ok);
			fn(res);
		}
	})(options.success);
	$.ajax(options);
}

// 加载子页面
function loadFrame(hash, success) {
	var mat = hash.substr(1).match(/^([^\?]*)(\?[^\?]*)?$/) || [],
		href = '/' + clientType + (mat[1] || '') + '.html' + (mat[2] || '');
	$.ajax({
		async: false, 	// prevent over-ajax when loading frames
		type: 'get',
		url:	href,
		success: function(resTxt) {
			location.hash = hashPage = hash;	// 顺序: hashPage > location.hash
			$frame.html(resTxt);
			success && success();
		},
		error: function(){
			/*$.get('/do/' + clientType + '/me', function(resObj){
				loadFrame(
					resObj['lectid'] ? '#/view' :
						clientType === 's' ? '#/enter' : '#/join'
				);
			});*/
			location.href = '/';
		}
	});
	// navbar active
	var mat = hash.match(/^([^?]+)/),
		head = mat ? mat[1] : '';
	if (mat) {
		$navbar.find('a[href^="'+ head +'"]').parent('li')
			.addClass('active').siblings().removeClass('active');
	}
	
}
// 刷新子页面
function reloadFrame(success) {
	loadFrame(location.hash, success);
}
function notify(msg, type) {
	// type 0 => danger, 1 => success
	$('#' + $.scojs_message.options.id).hide();
	$window.scrollTop(0); // 窗口返回最顶
	$.scojs_message(
		msg, $.scojs_message[[
			'TYPE_ERROR', 'TYPE_OK'
		][parseInt(type) || 0]]
	);
}

// 获取hash参数
function getHashParams(hash) {
	var pat = /([^?=&#]*)=([^?=&#]+)/g, params = {};
	decodeURIComponent(hash || window.location.hash)
		.replace(pat, function(a, b, c){
			if (b in params) {	// 已有该键
				if (! _.isArray(params[b])) params[b] = [params[b]];	// 数组化
				params[b].push(c);
			} else {
				params[b] = c;
			}
		});
	return params;
}

// 时分秒的显示
function strTime(time, isDiff) {
	var sTotal = Math.round((time) / 1000),
		h = Math.floor(sTotal/3600%24 + (isDiff ? 0 : 8)),
		m = Math.floor((sTotal%3600) / 60),
		s = Math.floor(sTotal%3600%60);
	h = h < 10 ? '0' + h : h;
	m = m < 10 ? '0' + m : m;
	s = s < 10 ? '0' + s : s;
	return h + ':' + m + ':' + s;
}