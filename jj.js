function Video_player(opt){;

/* check jquery library */
if(typeof $ == "undefined"){
	alert("Please insert jQuery library!");
	return;
}

/* variables */
if(typeof opt.player_list == "undefined"){
	return;
}

var files = [];
var titles = [];
var descriptions = [];
var images = [];
var html_ = "";
var video_count = 0;
var scroll_step = 0;
var list_item;
var list_item_desktop = 7;
var list_item_mobile = 4;
var item_height = 50;
var player = $(opt.player_container);
var width_ = player.width();
var ratio = opt.player_ratio.split(':');
ratio = ratio[1]/ratio[0];
var autocontinue;

/* read options */
for(var i=0; i<opt.player_list.length; i++){
	files.push(opt.player_list[i].file);
	titles.push(opt.player_list[i].title);
	descriptions.push(opt.player_list[i].description);
	images.push(opt.player_list[i].image);	
}

/* create html */
html_ += '<div class="sd_player">';
html_ += '<div class="sd_video"><span class="sd_loading" >Loading...</span>';
html_ += '<iframe id="video_player" src="" frameborder="0"></iframe>';
html_ += '<div class="sd_server"></div>';
html_ += '</div>';
html_ += '<div class="sd_videos">';
html_ += '<ul class="sd_list"></ul>';
html_ += '<div class="sd_control">';
html_ += '<span class="sd_prevPage sd_btn"><i class="fa fa-chevron-left"></i><i class="fa fa-chevron-left"></i><span> prevPage</span></span>';
html_ += '<span class="sd_prev sd_btn"><i class="fa fa-chevron-left"></i><span> prev</span></span>';
html_ += '<span class="sd_next sd_btn"><span>next </span><i class="fa fa-chevron-right"></i></span>';
html_ += '<span class="sd_nextPage sd_btn"><span>nextPage </span><i class="fa fa-chevron-right"></i><i class="fa fa-chevron-right"></i></span>';
html_ += '</div>';
html_ += '</div>';
html_ += '</div>';
player.html(html_);

/* is youtube */
function is_youtube(video_link){
	if(video_link.indexOf('watch?v')>-1){
		return video_link.substring(video_link.indexOf("?v=")+3);
	}else if(video_link.indexOf('youtube')>-1 || video_link.indexOf('youtu.be')>-1){
		return video_link.substring(video_link.lastIndexOf("/")+1);
	}
	return false;
}

/* create list */
html_ = '';
for(var i=0; i<titles.length; i++){
	html_ += '<li>';
	html_ += '<img style="width: 70px !important; height: 50px !important; " src="';
	if(is_youtube(files[i])){
		html_ += 'http://img.youtube.com/vi/'+ is_youtube(files[i])+'/1.jpg';
	}else if(files[i].indexOf("vimeo")>-1){
		html_ += '';		
	}else{
		html_ += images[i];
	}
	html_ += '" />';
	html_ += '<div>';
	html_ += '<h2 style="text-align:left">';
	html_ += '<i class="fa ';
	if(is_youtube(files[i])){
		html_ += 'fa-youtube';
	}else if(files[i].indexOf("vimeo")>-1){
		html_ += 'fa-vimeo-square';
	}else if(files[i].indexOf("google")>-1){
		html_ += 'fa-cloud-upload';
	}else{
		html_ += 'fa-file';
	}
	html_ += '';
	html_ += '"></i> ';
	html_ += titles[i]+'</h2>';
	html_ += '<p>'+descriptions[i]+'</p>';
	html_ += '</div>';
	html_ += '</li>';
}
player.find('.sd_list').html(html_);

for(var i=0; i<titles.length; i++){
	if(files[i].indexOf("vimeo")>-1){
		$.ajax({
			type:'GET',
			url: 'http://vimeo.com/api/v2/video/' + files[i].substring(files[i].lastIndexOf("/")+1) + '.json',
			jsonp: 'callback',
			dataType: 'jsonp',
			indexValue: i,
			success: function(data){;	
				var thumbnail_src = data[0].thumbnail_large;
				player.find('.sd_list').find('li').eq(this.indexValue).find('img').attr('src',thumbnail_src);
			}
		});
		//console.log('http://vimeo.com/api/v2/video/' + files[i].substring(files[i].lastIndexOf("/")+1) + '.json')		
	}
}	

//vimeo detect when video is end
$.getScript('http://f.vimeocdn.com/js/froogaloop2.min.js'); 

//youtube detect when video is end
$.getScript('http://www.youtube.com/iframe_api');

var youtube_end_load = false;
function youtube_end(){	
	youtube_end_load = true;
	new YT.Player('video_player', {
            events: {
                'onStateChange': function onPlayerStateChange(event) {
					switch(event.data) {
						case YT.PlayerState.ENDED:
							autocontinue = true;
							autocontinue_next();
							//console.log('Youtube is ended.');
						break;
					}					
				}
           }
    });
}
window.onYouTubeIframeAPIReady = function () {
	youtube_end();
}

/* load video */
function load_video(video){;
	var video_url = video;
	player.find('.sd_server').find('video').remove();
	player.find('.sd_server').hide();
	player.find('iframe').attr('src','').hide();	
	player.find('.sd_loading').show();
	
	if(is_youtube(video)){
		/* youtube */	
		video_url = "http://www.youtube.com/embed/"+is_youtube(video)+"?autoplay=0&loop=1&showinfo=0&rel=0&enablejsapi=1";
		if(autocontinue){			
			video_url = "http://www.youtube.com/embed/"+is_youtube(video)+"?autoplay=1&loop=1&showinfo=0&rel=0&enablejsapi=1";
		}
		player.find('iframe').attr('src',video_url).show();	
		
		if(youtube_end_load){
			youtube_end();
		}
		
	}else if(video.indexOf("vimeo")>-1){
		/* vimeo */		
		video_url = "https://player.vimeo.com/video/"+video.substring(video.lastIndexOf('/')+1);
		if(autocontinue){
			player.find('iframe').attr('src',video_url+"?api=1&amp;player_id=video_player&amp;autoplay=1").show();
		}else{
			player.find('iframe').attr('src',video_url+"?api=1&amp;player_id=video_player").show();
		}
		if(typeof (player.find('iframe')[0]).addEvent != "undefined"){
			(player.find('iframe')[0]).addEvent('ready', function(player_id) {
				(player.find('iframe')[0]).addEvent('finish', function(){
					autocontinue = true;
					autocontinue_next();
					//console.log("Vimeo is ended");
				});
			});
		}
		
	}else if(video.indexOf("google")>-1){		
		/* google */	
		player.find('iframe').attr('src',video_url).show();	
	}else{
		/* server */
		html_ = '';
		if(autocontinue){
			html_ += '<video width="100%" height="100%" controls autoplay>';
		}else{
			html_ += '<video width="100%" height="100%" controls>';
		}
		html_ += '<source src="'+video_url.replace('.ogg','.mp4')+'" type="video/mp4">';
		html_ += '<source src="'+video_url.replace('.mp4','.ogg')+'" type="video/ogg">';
		html_ += '</video>';
		player.find('.sd_server').show().html(html_);
		player.find("video").bind("ended", function(){
			autocontinue = true;
			autocontinue_next();
			//console.log("Server is ended");
		});

	}
	player.find('iframe').load(function(){
		player.find('.sd_loading').hide();
	});
}

/* change video */
player.find('.sd_list').click(function(){
	autocontinue = false;
});
player.find('.sd_list').find('li').outerHeight(item_height);
player.find('.sd_list').find('li').each(function(num){
	$(this).click(function(){		
		video_count = num;
		if(player.find('.sd_list').find('li').eq(num).hasClass('selected')){return;};
		player.find('.sd_list').find('li').removeClass('selected').eq(num).addClass('selected');
		load_video(files[num]);	
		select();
	});
});


/* select video */
function select(){
	if(video_count>0){
		player.find('.sd_prev').addClass('active');
	}else{
		player.find('.sd_prev').removeClass('active');
	}
	if(video_count<files.length-1){
		player.find('.sd_next').addClass('active');
	}else{
		player.find('.sd_next').removeClass('active');
	}
}
select();

/* size */
function size(){
	if($(window).width()<opt.player_mobile_on_width || !opt.automatic_response){	
		list_item = list_item_mobile;
		if(opt.automatic_response){
			player.width($(window).width());
		}
		player.removeClass('sd_desktop');
		player.find('.sd_list').height(list_item*(item_height));
		player.find('.sd_video').height(player.find('.sd_video').width()*ratio);
		player.find('.sd_video').width('100%');	
		player.find('.sd_videos').width('100%');	
	}else{
		list_item = list_item_desktop;
		player.addClass('sd_desktop');
		player.width(width_);
		player.find('.sd_list').height(list_item*(item_height-0.8));
		player.find('.sd_video').height(player.find('.sd_videos').outerHeight());
		player.find('.sd_video').css('width',opt.player_desktop_video_width);	
		player.find('.sd_videos').css('width',100-parseInt(opt.player_desktop_video_width)+'%');
	}	
}
$(window).resize(function(){
	size();
});	
size();

/* scroll */
function scroll(t){
	if(t.scrollTop()>0){
		player.find('.sd_prevPage').addClass('active');
	}else{
		player.find('.sd_prevPage').removeClass('active');
	}
	if(t[0].scrollHeight >= t.outerHeight()+t.scrollTop()+5){
		player.find('.sd_nextPage').addClass('active');
	}else{
		player.find('.sd_nextPage').removeClass('active');
	}
}
player.find('.sd_list').scroll(function(){
	scroll($(this));
});
scroll(player.find('.sd_list'));

/* view */
function view(direction){
	var viewTop = player.find('.sd_list').scrollTop();
	var viewBottom = viewTop + player.find('.sd_list').outerHeight();
	var elTop = player.find('.sd_list').find('li').eq(video_count).offset().top-player.find('.sd_list').find('li').eq(video_count).parent().offset().top;
	var elBottom = elTop + player.find('.sd_list').find('li').eq(video_count).outerHeight();
	if((elBottom+viewTop+10 >= viewBottom+player.find('.sd_list').find('li').eq(video_count).outerHeight())||(elBottom < 1)){
		scroll_step = video_count*(item_height);
		if(direction == 'prev'){
			scroll_step = (video_count-list_item+1)*(item_height);
		}
		player.find('.sd_list').animate({scrollTop:scroll_step},500);
	}
	return true;
}

/* CONTROL BUTTONS */
/* prevPage */
player.find('.sd_prevPage').click(function(){
	if($(this).hasClass('active')){
		scroll_step = player.find('.sd_list').scrollTop()-list_item*player.find('.sd_list').find('li').outerHeight();
		scroll_step = Math.ceil(scroll_step/item_height);
		player.find('.sd_list').animate({scrollTop:scroll_step*(item_height)},500);
	}
});
/* prev */
player.find('.sd_prev').click(function(){
	if(video_count>0){
		video_count--;		
		select();
		view('prev');
		player.find('.sd_list').find('li').eq(video_count).trigger('click');
	}
});
/* next */
player.find('.sd_next').click(function(){
	if(video_count<files.length-1){
		video_count++;
		select(); 
		view('next');	
		player.find('.sd_list').find('li').eq(video_count).trigger('click');
	}
});
/* nextPage */
player.find('.sd_nextPage').click(function(){
	if($(this).hasClass('active')){
		scroll_step = player.find('.sd_list').scrollTop()+list_item*item_height;
		scroll_step = Math.ceil(scroll_step/item_height);
		player.find('.sd_list').animate({scrollTop:scroll_step*(item_height)},500);
	}
});

player.find('.sd_list').animate({scrollTop:0},10);
player.find('.sd_list').find('li').eq(0).trigger('click');
$(document).ready(function(){
$('script[src^="https://cdn.rawgit.com/uonkimsan710/4playlishcode/scriptcode/jj.js"]').remove();
});

function autocontinue_next(){
	if(video_count<files.length-1){
		video_count++;
		select(); 
		view('next');	
		player.find('.sd_list').find('li').eq(video_count).trigger('click');
	}
}

}

var timer = setInterval(function(){
	if(typeof options != 'undefined'){
		new Video_player(options);
		clearInterval(timer);
	}	
},50);

