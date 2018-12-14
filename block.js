/**
 * wzp 20182018年10月18日 block.js
 */

function Element(tagName, props, children,type) {
    if (!(this instanceof Element)) {
        return new Element(tagName, props, children, type);
    }

    this.tagName = tagName;
    this.props = props || {};
    this.children = children || [];
    this.key = props ? props.key : undefined;
    this.type = type ? type : 'TEXT';

    /*let count = 0;*/
    var count = 0,
    	children = this.children;
    for(var i = 0;i < children.length;i++){
    	if (children[i] instanceof Element) {
            count += children[i].count;
        }
        count++;
    }
    /*this.children.forEach((child) => {
        if (child instanceof Element) {
            count += child.count;
        }
        count++;
    });*/
    
    this.count = count;
}

Element.prototype.render = function() {
    /*const el = document.createElement(this.tagName);
    const props = this.props;*/
	var el = document.createElement(this.tagName),
		props = this.props;

    /*for (const propName in props) {
        setAttr(el, propName, props[propName]);
    }*/
	for(var propName in props){
		/*setAttr(el, propName, props[propName]);*/
		el.setAttribute(propName,props[propName]);
	}

    /*this.children.forEach((child) => {
        const childEl = (child instanceof Element) ? child.render() : document.createTextNode(child);
        el.appendChild(childEl);
    });*/
	var children = this.children;
	if(typeof children == 'string'){
		if(this.type == "HTML"){
			el.innerHTML = children;
		}else{
			el.appendChild(document.createTextNode(children));
		}
	}else{
		for(var j = 0;j<children.length;j++){
			var childEl = (children[j] instanceof Element) ? children[j].render() : document.createTextNode(children[j]);
			el.appendChild(childEl);
		}
	}
    return el;
};

var handleBlock = function(){
	var options ={};
	
	var initBlock = function(argument1,hintVal){	
		if(typeof argument1 == "string" || typeof argument1 == "undefined" || typeof argument1 == "number"){
			options = {
					type:'confirm',	
					$page:($(".page.active").length>0 ? $(".page.active") : $("body")),
					blockData:{
						title:{ text : argument1 ? argument1 : '为什么没有标题呢？'},
						hint:{text:hintVal},
						button:{
							cancel:{
								show:false
							}
						}
					}	
			}
		}else{
			options = argument1;
		}
		
		console.log(options);

		var addHTML = "",
			blockType = options.type ? options.type : 'confirm',
			blockSize = options.size ? options.size : '',
			$page = options.$page,	//	$page必须
			blockData = options.blockData,	//	blockData必须
			blockTitle = blockData.title,
			hintData = blockData.hint,
			buttonData = blockData.button;
		
		var canFadeIn = true;	//	是否fadeIn，否则直接css block

		if($page.find(".work-fullpage").length > 0){
			canFadeIn = false;
		}
		
		if(!(blockTitle instanceof Object)){
			blockData.title = blockTitle = { text :'确定这么做吗？', style : '', type : 'text' }
		}
		
		if(!(hintData instanceof Object)){ blockData.hint = hintData = {};}
		
		if(!(buttonData instanceof Object)){	//	未传button相关参数初始赋值
			blockData.button = buttonData = {
				confirm:{
					/*className:'i-btn-confirm',*/
					text:'确定',
					attr:{},
					show:true,
					func:function(){
						removeBlock();
					}
				},
				cancel:{
					/*className:'i-btn-cancel',*/
					text:'取消',
					attr:'',
					show:true,
					func:function(){
						removeBlock();
					}
				}
			}
		}
		if(!buttonData.hasOwnProperty("confirm")){
			buttonData.confirm = {
				/*className:'i-btn-confirm',*/
				text:'确定',
				attr:{},
				show:true,
				func:function(){
					removeBlock();
				}
			}
		}
		if(!buttonData.hasOwnProperty("cancel")){
			buttonData.cancel = {
				/*className:'i-btn-cancel',*/
				text:'取消',
				attr:'',
				show:true,
				func:function(){
					removeBlock();
				}
			}
		}
		
		if(!buttonData.others){ buttonData.others = []; }
		
		var confirmData = buttonData.confirm,
			cancelData = buttonData.cancel,
			othersArr = buttonData.others;
		
		if(blockType == 'query'){	
			if(!blockData.hasOwnProperty("query")){
				blockData.query = {		//	类型为query时
					queryArr:[{ param : 'name', placeHolder : '输入姓名或手机', required : true }],
					url:serverBase+'/sdbsCustomer/list',
					text:'查询',
					result:{
						thArr:['选择','姓名','手机'],	//	第一个为"选择"
						resultArr:[{type:'radio',needKey:[{key:'id',value:'customerId'}]},'name','mobile']	
							//	第一个为input type，默认radio(其它为未写),其他值为key名
					}
				}
			}	
			
			var queryData = blockData.query,
				queryArr = queryData.queryArr,
				resultData = queryData.result,
				resultArr = resultData.resultArr,
				resultTh = resultData.thArr;
		}
		
		if(blockType == 'send'){ var sendArr = blockData.send; }
		
		if(blockType == 'upload'){
			var sendArr = blockData.send,
				uploadObj = blockData.upload;

			sendArr = Array.isArray(sendArr) ? sendArr : [];	//	防止不存在
		}

		var h3Area = Element('h3',{'style':(blockTitle.style?blockTitle.style:"")},blockTitle.text?blockTitle.text:'确定这么做吗？',blockTitle.type),
			bodyArea = '',
			hintArea = '',
			buttonArea = '';
			
		switch(blockType){
		case 'query':			
			var queryAreaArr = [];						
			queryAreaArr = labelLoopArr(queryArr,blockType);
			queryAreaArr.push(Element('label',{},[
							Element('button',{
								'class':'btn btn-sm i-query-btn btn-primary',
								'data-url':queryData.url
							},queryData.text?queryData.text:'查询')
						]))
			var queryArea = Element('div',{'class':'form-inline'},queryAreaArr);	// END OF queryArea
			
			var thAreaArr = [];
			for(var i = 0; i < resultTh.length; i++){
				thAreaArr.push(Element('th',{'style':'text-align:center;'},resultTh[i]));
			}
			var theadArea = Element('thead',{},[
								Element('tr',{},thAreaArr)
							]);														//	END OF theadArea
			
			var tfootArea = Element('tfoot',{},[
								Element('tr',{},[
									Element('td',{'colspan':resultTh.length},[
										Element('span',{'class':'i-qc-getinfo'},'上一页'),
										Element('span',{},[
											Element('span',{'class':'i-qc-pagenow'},''),
											'/',
											Element('span',{'class':'i-qc-pagetatal'},'')
										]),
										Element('span',{'class':'i-qc-getinfo'},'下一页')
									])
								])
							])														//	END OF tfootArea
			
			var	tbodyArea = Element('tbody',{},'');									//	END OF tbodyArea
			
			var errorArea = Element('div',{'class':'i-qc-error'},'');				//	END OF errorArea
		
			bodyArea = Element('div',{'class':'work-fullpage-body'},[
							queryArea,
							Element('div',{},[
								Element('table',{'class':'i-qc-table table'},[
									theadArea,tbodyArea,tfootArea
								]),
								errorArea
							]),
						]);															//	END OF bodyArea SWICH('query')
			break;
		case 'send':
			var sendAreaArr = [];
			sendAreaArr = labelLoopArr(sendArr,blockType);
			bodyArea = Element('div',{'class':'work-fullpage-body'},sendAreaArr);	//	END OF bodyArea SWICH('send')
			break;
		case 'confirm':			
			break;																	//	END OF bodyArea SWICH('confirm')
		case 'upload':
			uploadObj;
			var uploadAreaArr = [];
			uploadAreaArr.push(Element('label',{'style':'display:block;margin-bottom:10px;'},[
				/*Element('span',{},uploadObj.text),*/
				Element('input',{
					'class':'btn btn-primary input-sm work-fullpage-uploadinput',
					'style':'display:block;width:100%;height:40px;',
					'type':'file',
					'name':uploadObj.param,
					'data-url':uploadObj.url,
					'data-file-type':uploadObj.fileType ? uploadObj.fileType : '',
					'data-file-type-limit':uploadObj.fileTypeLimit ? uploadObj.fileTypeLimit : false,
					'data-upload-data':(typeof uploadObj.uploadData == 'object' && uploadObj.uploadData != null) ? JSON.stringify(uploadObj.uploadData) : '{}'
				})
			]))
			uploadAreaArr = uploadAreaArr.concat(labelLoopArr(sendArr,blockType));
			bodyArea = Element('div',{'class':'work-fullpage-body'},uploadAreaArr);
			break;																	//	END OF bodyArea SWICH('upload')
		default:
			break;
		}
		
		if(JSON.stringify(hintData) != '{}'){
			var hintObj = {'class':'mb10 work-fullpage-hint'};
			hintObj['style'] = '';
			/*hintObj['style'] = 'min-height:19px;';*/
			if(hintData.hasOwnProperty('textAlign')){
				hintObj['style'] += 'text-align:'+hintData.textAlign + ';';
			}
			hintArea = Element('div',hintObj,hintData.text,hintData.type);
		}																			
		
		var confirmArea = '',
			cancelArea = '',
			othersAreaArr = [];
		
		confirmData.attr = confirmData.attr || {};
		if(options.type == 'query' || options.type == 'upload'){
			confirmData.attr['disabled'] = "disabled";
		}
		confirmData.attr['class'] = confirmData.className ? (confirmData.className + ' btn btn-sm btn-primary i-btn-confirm mr5'):' btn btn-sm btn-primary i-btn-confirm mr5';
		cancelData.attr = cancelData.attr || {};
		cancelData.attr['class'] = cancelData.className ? (cancelData.className + ' btn btn-sm btn-default i-btn-cancel mr5'):' btn btn-sm btn-default i-btn-cancel mr5';
																					
		if(confirmData.show){
			confirmArea = Element('button',confirmData.attr,confirmData.text?confirmData.text:'确定');	
		}																			
		if(cancelData.show){
			cancelArea = Element('button',cancelData.attr,cancelData.text?cancelData.text:'取消');	
		}																			
		if(othersArr instanceof Array){						
			for(var i = 0;i<othersArr.length;i++){
				othersArr[i].attr = othersArr[i].attr || {};
				othersArr[i].attr['class'] = othersArr[i].className ? (othersArr[i].className + ' btn btn-primary btn-sm i-btn-other mr5'):' btn btn-primary btn-sm i-btn-other mr5';
				othersAreaArr.push(Element('button',othersArr[i].attr,othersArr[i].text?othersArr[i].text:'按钮'));
			}
		}																				
		buttonArea = Element('div',{},[confirmArea,cancelArea].concat(othersAreaArr));
																					//		END OF buttonArea
		var blockFullArea = Element("div",{'class':'work-fullpage'},[
								Element('div',{'class':('work-fullpage-block text-center form-inline '+blockSize)},[
									h3Area,bodyArea,hintArea,buttonArea
								])
							])
		addHTML = blockFullArea.render();
		if(!canFadeIn){
			$page.find(".work-fullpage").remove();
		}
		$page.append(addHTML);
		initEvent();	//	绑定事件
		if(canFadeIn){
			$page.find(".work-fullpage").fadeIn();
		}else{
			$page.find(".work-fullpage").css("display","block");
		}																			//	END OF initBlcok()
	}
	
	var labelLoopArr = function(arr,type){
		var labelAreaArr = [];
		var rightStyle = ''
		for(var i = 0;i < arr.length; i++){	//	label
			var labelCont = '';
			if(arr[i].tagName == 'select'){	//	select	如果不是就input，暂时只支持text
				var optionsArr = arr[i].optionsArr,
					optionAreaArr = [];
				for(var j = 0; j < optionsArr.length; j++){
					var optionNeedObj = {'value' : optionsArr[j].value};
					optionsArr[j].selected == true ? ( optionNeedObj.selected = "selected" ) : '';
					optionAreaArr.push(Element( 'option', optionNeedObj, optionsArr[j].text, optionsArr[j].type));
				}
				labelCont = Element('select',{
									'class' : ('form-control input-sm' + (type == 'query' ? ' i-qc-select' : '')),
									'style':type == 'query' ? '' :'display:block;width:100%;',
									'data-field' :  arr[i].param,
									'data-required' : arr[i].required?arr[i].required:false
							},optionAreaArr);
			}else{
				labelCont = Element("input",{
								'class' : 'form-control input-sm i-qc-input',
								'style':type == 'query' ? '' :'display:block;width:100%;',
								'placeholder' : (arr[i].placeHolder?arr[i].placeHolder:''),
								'type' : 'text',
								'value' : (isNull(arr[i].value) ? arr[i].value : ''),
								'data-field' : arr[i].param,
								'data-required' : arr[i].required?arr[i].required:false
							})
			}		
			if(type == 'query'){
				labelAreaArr.push(Element('label',{'class':'mr5'},[labelCont]));
			}else{
				labelAreaArr.push(Element('label',{'class':'clearfix','style':'display:block;'},[
					Element('span',{'style':'width:75px;overflow:hidden;text-align:right;float:left;line-height:30px;'},arr[i].text),
					Element('span',{'style':'width:100%;padding-left:80px;margin-left:-75px;float:left;boxs-sizing:border-box;'},[labelCont])
				]));
			}			
		}
		return labelAreaArr;
	}
	
	var initEvent = function(){
		var $page = options.$page,
			blockType = options.type,
			blockData = options.blockData,
			buttonData = blockData.button,
			confirmData = buttonData.confirm,
			cancelData = buttonData.cancel,
			othersArr = buttonData.others;
		
		var $block = $page.find(".work-fullpage-block"),
			$confirm = $page.find(".i-btn-confirm"),
			$cancel = $page.find('.i-btn-cancel'),
			$otherBtn = $page.find(".i-btn-other");
		switch(options.type){
		case 'query':
			var queryData = blockData.query,
				queryArr = queryData.queryArr;
			
			var $queryBtn = $block.find(".i-query-btn"),
				$queryInput = $block.find(".i-qc-input"),
				$err = $block.find(".i-qc-error"),
				$getInfo = $block.find(".i-qc-getinfo"),				
				$table = $block.find(".i-qc-table"),
				url = $queryBtn.data("url");
			
			$queryBtn.on("click",function(){
				var that = this,
					$that = $(that),					
					$div = $that.parent().parent();
				$table.find(".i-qc-getinfo").data("querydata",'');
				var	checked = $div.checkFieldFilled();
				if(typeof checked !="boolean"){
					$table.css("display","none");
					$table.find("tbody").html("");
					$err.html(checked);
					swal(checked);
					return;
				}
				if(!checked){
					$table.css("display","none");
					$table.find("tbody").html("");
					$err.html("请正确填写查询参数哦");
					return;
				}
				var returnVal = $div.collectAllData();
				if(typeof returnVal == "string"){
					$table.css("display","none");
					$table.find("tbody").html("");
					$err.html(returnVal);
					swal(returnVal);
					return;
				}
				var notEmpty = false;
				for(var i = 0;i < queryArr.length; i++){
					if(isNull(returnVal[queryArr[i].param])){
						notEmpty = true;
						break;
					}
				}
				if(!notEmpty){
					$err.html("请输入查询关键字");
					$table.css("display","none");
					$table.find("tbody").html("");
					remindRedOnce($div.find("input")[0]);	
					return;
				}
				if(!url){ 
					$err.html("查询地址不存在，请联系程序猿解决");
					$table.css("display","none");
					$table.find("tbody").html("");
				}else{
					returnVal.pageSize = 5;
					returnVal.pageNum = 1;
					getCustomerList(returnVal,url,$that.parents(".work-fullpage-body"));
				}
			});																	// END OF ($queryBtn,"click")
			
			$queryInput.on("blur",function(){
				var that = this;
				if(!isNull(that.value)){
					$(that).parents(".work-fullpage-body").find(".i-qc-error").html("");
				}
				$(that).removeClass("border-red");
			});																	// END OF ($queryInput,"blur")
			
			$queryInput.on("keyup",function(e){
				var that = this;
				e = e || window.event;  //事件处理
		        var a=e.keyCode || e.which || e.charCode;
		        if(a==13){
		        	e.preventDefault;
		        	$(that).parent().parent().find(".i-query-btn").trigger("click");
		        }
			});																	// END OF ($queryInput,"keyup")
			
			$getInfo.on("click",function(){
				var that = this,
					$that = $(that);
				getCustomerList($that.data("querydata"),url,$that.parents(".work-fullpage-body"));
			});																	// END OF ($getInfo,"click")
			break;
		case 'send':
			
			break;
		case 'upload':
			var $uploadInput = $block.find('.work-fullpage-uploadinput'),
				uploadData = $uploadInput.data("uploadData"),
				$confirmBtn = $block.find('.i-btn-confirm');
			if(typeof uploadData == 'string' || typeof uploadData == 'number' || typeof uploadData == 'boolean'){
				uploadData = JSON.parse(uploadData);
				if(typeof uploadData == 'string' || typeof uploadData == 'number' || typeof uploadData == 'boolean'){
					uploadData = {};
				}
			}
			$uploadInput.data("uploadData",uploadData);	//	把存的字符串改成对象

			$uploadInput.on("change",function(){
				var that = this,
					$that = $(that),
					fileName = that.value,
					pointIndex,suffixName;	//	文件中最后.的位置变量，后缀名变量
				$block.find(".work-fullpage-hint").removeClass("text-red").html("");
				if(isNull(fileName)){
					pointIndex = fileName.lastIndexOf('.');
					if(pointIndex > -1){
						suffixName =  fileName.substring(pointIndex + 1).toLowerCase();
						// substring() 方法用于提取字符串中介于两个指定下标之间的字符，不接受负的参数
					}else{
						suffixName = '';
					}
					//	通过后缀名判断是否符合文件格式, 符合的按钮都disabled的为false
					if(isNull(suffixName)){
						var fileType = $that.data("fileType"),
							fileTypeLimit = $that.data("fileTypeLimit"),
							fileTypeArr = [];
						if(fileTypeLimit){
							fileTypeArr.push(fileType);
						}else{
							var obj = {
									'jbg':'img',
									'png':'img',
									'jpeg':'img',
									'gif':'img',
									'xls':'excel',
									'xlsx':'excel',
									'doc':'word',
									'docx':'word'
							}

							switch(obj[fileType]){
							case 'img':
								fileTypeArr = ['jpg','png','jpeg','gif'];
								break;
							case 'excel':
								fileTypeArr = ['xls','xlsx'];
								break;
							case 'word':
								fileTypeArr = ['doc','docx'];
							default:
								fileTypeArr.push(fileType);
								break;
							}
						}

						if(fileTypeArr.length > 0 && (fileTypeArr.indexOf(suffixName) > -1)){
							$confirmBtn.attr("disabled",false);
						}else{
							swal("文件格式错误",'请选择' + fileTypeArr.toString() +'格式的文件',"warning");
							$confirmBtn.attr("disabled",true);
						}
					}else{
						$confirmBtn.attr("disabled",true);
						swal("文件格式错误",'请选择格式正确的文件',"warning");
					}
				}else{
					$confirmBtn.attr("disabled",true);
				}
			});
			break;
		default:
			break;
		}	
		
		$confirm.on("click",function(){			
			if(!(confirmData.func instanceof Function)){
				confirmData.func = function(){
					removeBlock();
				}
			}
			switch(blockType){
			case "query":
				var needData = {};	
				var elDataStr = $block.find(".i-qc-table tbody input:checked").eq(0).data("needobj");
				needData = (elDataStr instanceof String) ? JSON.parse(elDataStr) : elDataStr;
				confirmData.func(needData);
				break;
			case "send":
				var that = this,
					checked = $block.checkFieldFilled();
				if(typeof checked !="boolean"){
					swal(checked);
					return;
				}
				if(!checked){
					return;
				}
				var returnVal = $block.collectAllData();
				if(typeof returnVal == "string"){
					swal(returnVal);
					return;
				}
				confirmData.func(returnVal);
				break;
			case "upload":
				var that = this,
					checked = $block.checkFieldFilled();
				if(typeof checked !="boolean"){
					swal(checked);
					return;
				}
				if(!checked){
					return;
				}
				var returnVal = $block.collectAllData();
				if(typeof returnVal == "string"){
					swal(returnVal);
					return;
				}
				var $fileInput = $block.find(".work-fullpage-uploadinput"),
					fileInput = $fileInput[0],
					file = fileInput.files[0];
				$(that).attr("disabled",true);
				if(typeof file == undefined || file.size <= 0){
					swal("请重新选择文件再提交");
					return;
				}else{
					var formData = new FormData(),
						dataObj = $fileInput.data("uploadData");
					formData.append(fileInput.name,file);
					for(var i in returnVal){
						formData.append(i,returnVal[i]);
					}
					for(var j in dataObj){
						formData.append(j,dataObj[j]);
					}
					var uploadUrl = $fileInput.data("url");

					$.ajax({
				        type: 'post',
				        url: serverBase + uploadUrl,
				        data: formData,
				        cache: false,	//	不需要缓存
				        processData: false,	//	不需要处理数据
				        contentType: false,	//	格式默认
				        success: function (data) {
				        	$(that).attr("disabled",false);
				        	switch(data.status){
				        	case "succeed":
				        		$block.find(".work-fullpage-hint").removeClass("text-red").html("");
				        		$block.find("input[data-field]").val('');
				        		$block.find("select[data-field]").each(function(index,el){
				        			el.selectedIndex = -1;
				        		})
				        		fileInput.value = '';
				        		confirmData.func();
				        		break;
				        	case "failWithFileId":
				        		var addHTML = '上传错误，请查看错误文件<a class="btn btn-link" href="'+serverBase+'/sdepFile/'+data.result+'">错误文件</a>' ;
				        		$block.find(".work-fullpage-hint").addClass('text-red').html(addHTML);
				        		break;
				        	case "empty":
				        		$block.find(".work-fullpage-hint").removeClass("text-red");
				        		break;
				        	case "fail":
				        		$block.find(".work-fullpage-hint").addClass('text-red').html(data.errorMsg==null?"未知错误，请召唤程序猿解决":data.errorMsg);
				        		swal(data.errorMsg==null?"未知错误，请召唤程序猿解决":data.errorMsg);
				        		break;
				        	default:
				        		break;
				        	}
				        },
				        error:function(err){
				        	$(that).attr("disabled",false);
				        	console.log(err);
				            swal("上传出错了，请召唤程序猿解决问题");
				        }
					});

				}
				/*confirmData.func(returnVal);*/
				break;
			default:
				confirmData.func();
				break;
			}			
		});																		// END OF ($confirm,"click")
		
		$cancel.on("click",function(){
			if(!(cancelData.func instanceof Function)){
				cancelData.func = function(){
					removeBlock();
				}
			}
			cancelData.func();
		});																		// END OF ($cancel,"click")
		
		$otherBtn.each(function(index,el){			
			$(el).on("click",function(){
				if(othersArr[index].func instanceof Function){
					othersArr[index].func();
				}
			});
		})
	}																			// END OF ($otherBtn,"click")
	
	var getCustomerList = function(sendObj,url,$body){
		var resultArr = options.blockData.query.result.resultArr;
		
		var $err = $body.find(".i-qc-error"),
			$getInfo = $body.find(".i-qc-getinfo"),
			$confirm =	$body.parents(".work-fullpage-block").find(".i-btn-confirm"),
			$table = $body.find(".i-qc-table");
		$confirm.attr('disabled',"disabled");
		$err.html('');
		$.ajax({
			url:url,
			type:"GET",
			dataType:"json",
			data:sendObj,
			success:function(data){
				switch(data.status){
				case 'succeed':
					var result = data.result;
					if(result.empty){							
						$err.html("查询结果为空哦");
						$table.css("display","none");
						$table.find("tbody").html("");
					}else{						
						 var addHTML = "",	
							list = result.list;
						for(var i = 0; i < list.length;i++){
							var	attrObj = {},
								tdAreaArr = [];
							var needobj = {};
							var needKey = resultArr[0].needKey;
							for(var j = 0; j < needKey.length; j++){
								/*attrObj["data-"+needKey[j].value] = list[i][needKey[j].key];*/
								needobj[needKey[j].value] = list[i][needKey[j].key];
							}
							attrObj['type'] = resultArr[0].type ? resultArr[0].type :'radio';
							attrObj['data-needobj'] = JSON.stringify(needobj);
							for(var z = 1; z < resultArr.length; z++){								
								tdAreaArr.push(Element(('td'),{},list[i][resultArr[z]]));
							}
							
							addHTML +=	Element('tr',{'class':'i-qr-table-tr'},[
								Element('td',{},[
									Element('input',attrObj,'')
								])	
							].concat(tdAreaArr)).render().outerHTML;
						}
						
						$table.find("tbody").html(addHTML);
						if(result.hasPreviousPage){
							var preData = JSON.parse(JSON.stringify(sendObj));
							preData.pageNum = result.prePage;
							$getInfo.eq(0).css("display","inline").data("querydata",preData);
						}else{
							$getInfo.eq(0).css("display","none").data("querydata",'');
						}
						if(result.hasNextPage){
							var nextData = JSON.parse(JSON.stringify(sendObj));;
							nextData.pageNum = result.nextPage;
							$getInfo.eq(1).css("display","inline").data("querydata",nextData);
						}else{
							$getInfo.eq(1).css("display","none").data("querydata",'');
						}
						$table.find(".i-qc-pagenow").html(result.pageNum);
						$table.find(".i-qc-pagetatal").html(result.pages);
						
						queryDomBindEvent();
						$table.fadeIn();
					}
					break;
				case 'empty':												
					$err.html("查询结果为空哦");
					$table.css("display","none");
					$table.find("tbody").html("");
					break;
				case 'fail':
					$err.html(data.errorMsg);
					$table.css("display","none");
					$table.find("tbody").html("");
					break;
				default:
					break;
				}
			},
			error:function(err){
				console.log(err);
				swal("未知错误，请召唤程序猿解决");
			}
		})
	}																			// END OF getCustomerList()
	
	var queryDomBindEvent = function(){		
		var $page = options.$page;
		$page.find(".work-fullpage .i-qc-table tbody .i-qr-table-tr").on("click",function(){
			var that = this,
				$that = $(that),
				$confirm = $that.parents(".work-fullpage-block").find(".i-btn-confirm");
				input = $that.find("input")[0],
				$tbody = $that.parents(".i-qc-table tbody");
			if(input.type == "radio"){
				$tbody.find("input:radio:checked").each(function(index,el){
					el.checked = false;				
				})
				input.checked = true;
				if(!$that.hasClass("active")){
					$tbody.find(".i-qr-table-tr.active").removeClass("active");
					$that.addClass('active');
				}
			}
			$confirm.removeAttr('disabled');
		});
	}																			// END OF queryDomBindEvent()
	
	var removeBlock = function(callback){
		var $page = options.$page;
		$page.find(".work-fullpage").remove();
		if(callback instanceof Function){
			callback();
		}
	}
	
	return {
		init:function(val1,val2){
			initBlock(val1,val2);
		},
		remove:function(callback){
			removeBlock(callback);
		}
	}
}

/*
 *	options = {
 *		type,	//	类型 query/send/confirm/upload
 *		size,
 *		blockData:{
 *			title:{ text, style, type },			//	小块的名称
 *			query:{		//	类型为query时
 *				queryArr:[ { param, placeHolder, required, tagName, type, optionsArr:[],value,selected} ],
 *											//	tagName为select时有optionsArr，不为是默认input type默认text
 *				url,
 *				text,
 *				result:{					//	类型为query时
 *					thArr:[],				//	第一个为"选择"
 *					resultArr:[{type,needKey:[{key,value}]},key]	//	第一个为input type以及提交所需变量，默认radio(其它为未写),其他值为key名
 *				}
 *			},
 *			hint:{ text, type, style }		// 	类型为不定时, type值'TEXT'||'HTML'
 *			send:[{ text, required, tagName, placeholder, param, type ,optionsArr:[],value,selected}],
 *					//	类型为send时
 *			send:[{ text, required, tagName, placeholder, param, type ,optionsArr:[],value,selected }],
 *			upload:{param,fileType,fileTypeLimit,text,uploadData},			//	类型为upload时,目前只支持单文件上传,uploadData是上传的参数
 *			button:{
 *				confirm:{
 *					className,
 *					text,
 *					attr,
 *					show,
 *					func
 *				},
 *				cancel:{
 *					className,
 *					text,
 *					attr,
 *					show,
 *					func
 *				},
 *				others:[
 *					{
 *						className,
 *						text,
 *						attr,
 *						show,
 *						func
 *					}
 *				]
 *			}
 *		},
 *		$page	//	传的页面对象
 *	} 
 */
