;(function () {
    'use strict';
    var mainImg      = $('#main-img-input'),
        watermark    = $('#watermark-input'),
        url = '../server/php/',
        disabledNode = $('.disabled'),
        workAreaWidth = $('.result__block').width(),
        workAreaHeight = $('.result__block').height(),
        downloadPopup = $('.download-popup'),
        noScaleWidthMainImg,
        noScaleHeightMainImg,
        noScaleWidthWM,
        widthMainImg,
        heightMainImg,
        widthWM,
        heightWM,
        maxWidthWM;

    mainImg.fileupload({
        thumbnail:false,
        add: function(e, data) {
            var acceptFileTypes = /^image\/(gif|jpe?g|png)$/i;
            imgSettings.containment = 'parent';
            if(!acceptFileTypes.test(data.originalFiles[0].type)) {
                $('#file-ext-error').show().children('.server__error-main').slideDown();
            }
            else if(data.originalFiles[0].size > 1500000) {
                $('#file-size-error').show().children('.server__error-main').slideDown();
            } else {
                data.submit();
            }
        },
        url: url + '?folder=main',
        dataType: 'json',
        done: function (e, data) {
            $('#main-img-input').siblings('.file-name').text(data.result.files[0].name);   // подстановка имени файла в инпуты
            $('#main-img-input').parent().siblings('.download__tooltip').hide();
            $('#watermark-input').siblings('.file-name').val('');
            $('#watermark-input').siblings('.file-name').text('');
            disabledNode.each(function(){
                $(this).addClass('disabled');
                $('#watermark-input').prop('disabled', true);
            });
            $('#main-img').attr('src', data.result.files[0].url).show();   // передача адреса картинки в канву
            imgSettings.tiling = false;
            $("<img alt='Водяной знак' src='' id='watermark' class='img_small'>").replaceAll('.img_small').hide();
            $('.position__second').trigger('click');
            if ($('#watermark-input').prop('disabled')){
                $('#watermark-input').prop('disabled', false);     // разблокировка второго input
                $('#watermark-wrap').children('.disabled').removeClass('disabled');
            }
            $.post(
                '../server/php/getsize.php',
                {
                    url: data.result.files[0].url
                },
                function(answer){
                    var param = $.parseJSON(answer);
                    getImgScale(param);
                }
            );

            $('#main-img').load(function(){
                var $this = $(this);

                widthMainImg = $this.width();
                heightMainImg = $this.height();
                if(widthMainImg && heightMainImg && widthWM && heightWM){
                    if (widthWM > widthMainImg || heightWM > heightMainImg){
                        imgSettings.containment = false;
                    } else {
                        imgSettings.containment = 'parent';
                    }
                }
            });
            downloadPopup.hide();
        },
        //включение анимации прогресса при загрузку тяжелых файлов
        progress: function () {
            downloadPopup.show();
        }
    });

    var getImgScale = function (param){
        noScaleWidthMainImg = param.width;
        noScaleHeightMainImg = param.height;
        var widthScale = workAreaWidth/noScaleWidthMainImg,
            heightScale = workAreaHeight/noScaleHeightMainImg;

        if (widthScale <= heightScale && (widthScale < 1 || heightScale < 1)){
            imgSettings.generalScale = widthScale;
        } else if (widthScale > heightScale && (widthScale < 1 || heightScale < 1)){
            imgSettings.generalScale = heightScale;
        } else {
            imgSettings.generalScale = 1;
        }
    };

    var getMaxWidthWM = function (){
        maxWidthWM = Math.round(noScaleWidthWM * imgSettings.generalScale);
    };

    watermark.fileupload({
        url: url + '?folder=watermark',
        dataType: 'json',
        thumbnail: false,
        add: function(e, data) {
            var acceptFileTypes = /^image\/(gif|jpe?g|png)$/i;
            if(!acceptFileTypes.test(data.originalFiles[0].type)) {
                $('#file-ext-error').show().children('.server__error-main').slideDown();
            }
            else if(data.originalFiles[0].size > 1500000) {
                $('#file-size-error').show().children('.server__error-main').slideDown();
            } else {
                data.submit();
            }
        },
        done: function (e, data) {
            $.post(
                '../server/php/getsize.php',
                {
                    url: data.result.files[0].url
                },
                function(answer){
                    var param = $.parseJSON(answer);
                    noScaleWidthWM = param.width;
                    getMaxWidthWM();
                    $('#wm-wrap').css({'top':'0px', 'left':'0px'});
                    $('#watermark').attr({'src' : data.result.files[0].url,  style : 'max-width:' + maxWidthWM + 'px'}).show();
                }
            );
            $('.position__second').trigger('click');
            $('#watermark-input').siblings('.file-name').text(data.result.files[0].name);
            $('#watermark-input').parent().siblings('.download__tooltip').hide();
            $('#watermark').load(function(){
                var $this = $(this);

                widthWM = $this.width();
                heightWM = $this.height();
                if(widthMainImg && heightMainImg && widthWM && heightWM){
                    if (widthWM > widthMainImg || heightWM > heightMainImg){
                        imgSettings.containment = false;
                    } else {
                        imgSettings.containment = 'parent';
                    }
                }
                $this.css('height', Math.round(heightWM));
            });
            disabledNode.each(function(){
                $(this).removeClass('disabled');
            });
            downloadPopup.hide();
        },
        //включение анимации прогресса при загрузку тяжелых файлов
        progress: function () {
            downloadPopup.show();
        }
    });
}());