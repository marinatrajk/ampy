
var pageTemplate = {
    type: "page",
    tag: "<amp-story-page>",
    renderElement: undefined,
    attributes: {
        id: {
            value: 1,
            required: true,
            editable: false
        }
    },
    children: []
    },
    layerTemplate = {
        type: "layer",
        tag: "<amp-story-grid-layer>",
        renderElement: undefined,
        attributes: {
            id: {
                value: 2,
                required: true,
                editable: false
            },
            template: {
                value: "fill",
                required: true,
                values: [
                    "fill", "vertical", "horizontal", "thirds"
                ]
            }
        },
        children: []
    },
    imageTemplate = {
        componentID: 1,
        type: "component",
        name: "Image Element",
        tag: "<amp-img>",
        renderElement: undefined,
        attributes: {
            id: {
                value: 3,
                required: true,
                editable: false
            },
            class: {
                value: "",
            },
            src: {
                value: "http://ampy.co/assets/cover.png",
                required: true
            },
            width: {
                value: "100px",
                required: true
            },
            height: {
                value: "100px",
                required: true
            },
            layout: {
                value: "responsive",
                required: true,
                values: [
                    "responsive"
                ]
            }
        }
    },
    videoTemplate = {
        componentID: 4,
        type: "component",
        name: "Video Element",
        tag: "<amp-video>",
        renderElement: undefined,
        attributes: {
            id: {
                value: 3,
                required: true,
                editable: false
            },
            class: {
                value: "",
            },
            controls:{
                value: true,
                editable: false
            },
            src: {
                value: "http://techslides.com/demos/sample-videos/small.mp4",
                required: true
            },
            width: {
                value: "100px",
                required: true
            },
            height: {
                value: "100px",
                required: true
            },
            poster: {
                value: ""
            }
        }
    },
    titleTemplate = {
        componentID: 2,
        type: "component",
        name: "Title Element",
        tag: "<h1>",
        renderElement: undefined,
        hasInnerText: true,
        attributes: {
            id: {
                value: 4,
                required: true,
                editable: false
            },
            class: {
                value: "",
            },
            text: {
                value: "Hello!",
                required: true
            }
        }
    },
    paragraphComponent = {
        componentID: 3,
        type: "component",
        name: "Paragraph Element",
        tag: "<p>",
        renderElement: undefined,
        hasInnerText: true,
        attributes: {
            id: {
                value: 4,
                required: true,
                editable: false
            },
            class: {
                value: "",
            },
            text: {
                value: "This is a paragraph",
                required: true
            }
        }
    };

var componentsTemplateList = [titleTemplate, imageTemplate, paragraphComponent, videoTemplate];


var bookend = {
        "share-providers": {
            "system" : true,
            "email": true,
            "twitter": true,
            "tumblr": true,
            "linkedin": true,
            "gplus": true,
            "whatsapp": true,
            "sms": true,
            "facebook": {"app_id": "254325784911610"}
        },
        "related-articles": {
            "Related Articles": [
                {
                    "title": "AMPY.co - AMP Story Generator",
                    "url": "http://ampy.co/",
                    "image": "http://ampy.co/assets/cover.png"
                }
            ]
        }
    };

var currentPages = [],
    nextElementID = 1;

function generateNewElement(template, customAttributes){
    var newTemplate = $.extend(true, {}, template),
        customAttributeKeys = Object.keys(customAttributes);
        
    for(var i=0; i < customAttributeKeys.length; i++){
        var attribute = customAttributeKeys[i];
        newTemplate.attributes[attribute].value = customAttributes[attribute];
    }

    if(newTemplate.type == "page"){
        newTemplate.renderElement = createNewRenderPage(newTemplate);
    } else if(newTemplate.type == "layer"){
        newTemplate.renderElement = createNewRenderLayer(newTemplate);
    } else if(newTemplate.type == "component"){
        newTemplate.renderElement = createNewRenderComponent(newTemplate);
    }

    return newTemplate;
}

function addChildToParent(child, parent){
    parent.children.push(child);

    if(child.type == "layer"){
        parent.renderElement.find(".page-layers").append(child.renderElement );
    }
    else if(child.type == "component"){
        parent.renderElement.find(".layer-components").append(child.renderElement );
    }

}

function addNewPage(){
    var newPage = generateNewElement(pageTemplate, {id: (nextElementID++)});

    currentPages.push(newPage);
    updateRender();
}

function addNewLayer(pageID){
    var newLayer = generateNewElement(layerTemplate, {id: (nextElementID++)});
    for(var i=0;i<currentPages.length;i++){
        if(currentPages[i].attributes.id.value == pageID){
            addChildToParent(newLayer, currentPages[i]);
            break;
        }
    }

    updateRender();
}

function addNewComponent(template, pageID, layerID){
    var newComponent = generateNewElement(template, {id: (nextElementID++)});
    for(var i=0;i<currentPages.length;i++){
        if(currentPages[i].attributes.id.value == pageID){
            for(var j=0;j<currentPages[i].children.length;j++){
                if(currentPages[i].children[j].attributes.id.value == layerID){
                    addChildToParent(newComponent, currentPages[i].children[j]);
                    break;
                }
            }
        }
    }
    updateRender();
}

function generateHTMLFromElement(template){
    var $element = $(template.tag),
        templateAttributes = template.attributes,
        templateAttributeKeys = Object.keys(templateAttributes);

    for(var i=0; i < templateAttributeKeys.length; i++){
        var attributeName = templateAttributeKeys[i],
            attributeValue = templateAttributes[templateAttributeKeys[i]].value;
        $element.attr(attributeName, attributeValue);
    }

    if(template.hasInnerText){
        $element.html(template.attributes.text.value);
    }

    if(template.children != undefined){
        for(var i=0; i < template.children.length; i++){
            var child = template.children[i];
            $element.append(generateHTMLFromElement(child));
        }
    }

    return $element;
}

function createNewRenderPage(template){
    var pageID = template.attributes.id.value;
    $newPage = $(".page.template").clone();
    $newPage.removeClass("template");
    $newPage.find(".page-title").text("Page " + pageID);
    $newPage.attr("data-id", pageID);
    $newPage.find(".delete-button").attr("data-id", pageID);

    generateAttributes(template, $newPage.find(".attributes"));

    return $newPage;
}

function createNewRenderLayer(template){
    var layerID = template.attributes.id.value;
    $newLayer = $(".layer.template").clone();
    $newLayer.removeClass("template");
    $newLayer.find(".component-title").text("Layer");
    $newLayer.attr("data-id", layerID);
    $newLayer.find(".delete-button").attr("data-id", layerID);

    for(var i=0;i<componentsTemplateList.length;i++){
        $newSelectOption = $("<option>");
        $newSelectOption.attr("value", componentsTemplateList[i].componentID);
        $newSelectOption.text(componentsTemplateList[i].name);
        $newLayer.find(".add-select").append($newSelectOption);
    }

    generateAttributes(template, $newLayer.find(".attributes"));

    return $newLayer;
}

function createNewRenderComponent(template){
    var componentID = template.attributes.id.value;
    $newComponent = $(".component.template").clone();
    $newComponent.removeClass("template");
    $newComponent.find(".component-title").text(template.name);
    $newComponent.attr("data-id", componentID);
    $newComponent.find(".delete-button").attr("data-id", componentID);

    generateAttributes(template, $newComponent.find(".attributes"));

    return $newComponent;
}

function generateAttributes(template, $attributesList){

    var templateAttributes = template.attributes,
        templateAttributeKeys = Object.keys(templateAttributes);

    for(var i=0; i < templateAttributeKeys.length; i++){

    var templateAttributes = template.attributes,
        templateAttributeKeys = Object.keys(templateAttributes);

        var attributeName = templateAttributeKeys[i],
            attribute = templateAttributes[templateAttributeKeys[i]],
            attributeValue = templateAttributes[templateAttributeKeys[i]].value;
            $newLayerAttribute = $("<div class='attribute'><span>" + attributeName + "</span></div>");

        //Dropdown
        if(attribute.values != undefined && attribute.values.length){
            $newLayerAttributeInput = $("<select class='attribute-input'>");
            $newLayerAttributeInput.attr("data-name", attributeName);
            for(var j=0;j<attribute.values.length;j++){
                $newLayerAttributeOption = $("<option>");
                $newLayerAttributeOption.attr("value", attribute.values[j]);
                $newLayerAttributeOption.text(attribute.values[j]);
                if(attribute.values[j] == attributeValue){
                    $newLayerAttributeOption.attr("selected", "selected");
                }
                $newLayerAttributeInput.append($newLayerAttributeOption);
            }
        }
        //Text field
        else{
            $newLayerAttributeInput = $("<input class='attribute-input'>");
            $newLayerAttributeInput.attr("data-name", attributeName);
            $newLayerAttributeInput.val(attributeValue);
        }

        if(templateAttributes[templateAttributeKeys[i]].editable === false){
            $newLayerAttributeInput.attr("disabled", "disabled");
            $newLayerAttribute.hide();
        }

        $newLayerAttribute.append($newLayerAttributeInput);

        $attributesList.append($newLayerAttribute);
    }

}

function updateAttribute(attributeName, attributeValue, elementID, elementList){
    for(var i=0;i<elementList.length;i++){
        if(elementList[i].attributes.id.value == elementID){
            elementList[i].attributes[attributeName].value = attributeValue;
        }
        else if(elementList[i].children != undefined && elementList[i].children.length){
            updateAttribute(attributeName, attributeValue, elementID, elementList[i].children);
        }
    }
}

function callUpdateAttribute(attributeName, attributeValue, elementID){
    updateAttribute(attributeName, attributeValue, elementID, currentPages);
    updateRender();
}

function removeRenderPage(pageID){
    var newPagesList = [];
    for(var i=0;i<currentPages.length;i++){
        if(currentPages[i].attributes.id.value != pageID){
            newPagesList.push(currentPages[i]);
        }
    }
    currentPages = newPagesList;
    updateRender();
}

function removeRenderComponent(componentID, layerID, pageID){
    console.log("remocing "+ componentID + " " + layerID + " " + pageID);
    for(var i=0;i<currentPages.length;i++){
        if(currentPages[i].attributes.id.value == pageID){
            var pageLayers = currentPages[i].children;
            for(var j=0;j<pageLayers.length;j++){
                if(pageLayers[j].attributes.id.value == layerID){
                    var layerComponents = pageLayers[j].children,
                    newLayerComponentList = [];
                    for(var k=0;k<layerComponents.length;k++){
                        if(layerComponents[k].attributes.id.value != componentID){
                            newLayerComponentList.push(layerComponents[k]);
                        }
                        else{
                            currentPages[i].children[j].renderElement.find("[data-id='"+componentID+"']").remove();
                        }
                    }
                    currentPages[i].children[j].children = newLayerComponentList;
                }
            }
            break;
        }
    }
    updateRender();
}


function removeRenderLayer(layerID, pageID){
    console.log("removeing " + layerID + " " + pageID);
    for(var i=0;i<currentPages.length;i++){
        if(currentPages[i].attributes.id.value == pageID){
            var pageLayers = currentPages[i].children,
                newPageLayersList = [];
            for(var j=0;j<pageLayers.length;j++){
                if(pageLayers[j].attributes.id.value != layerID){
                    newPageLayersList.push(pageLayers[j]);
                }
                else{
                    currentPages[i].renderElement.find("[data-id='"+layerID+"']").remove();
                }
            }
            currentPages[i].children = newPageLayersList;
        }
    }
    updateRender();
}

// Updates of Rendering

function updateRenderElements(){
    $(".pages").html("");

    for(var i=0;i<currentPages.length;i++){
        $(".pages").append(currentPages[i].renderElement);
    }

    $(".pages > .page:first-child .delete-page").remove();
}

function updateRender(){

    updateRenderElements();

    var finalHTML = "";
    for(var i=0;i<currentPages.length;i++){
        var $pageElement = generateHTMLFromElement(currentPages[i]);
        finalHTML += $pageElement.prop('outerHTML') + "\n\n";
    }

    var bookendBlob = new Blob([JSON.stringify(bookend)], { type: 'application/json' });
    var bookendBlobURL = URL.createObjectURL(bookendBlob);
    

    var wrapperHTMLOpen = '<html>';
    var wrapperHTMLClose = '</html>';
    var wrapperHTMLPart1 = '<head><meta charset="utf-8"><script async src="https://cdn.ampproject.org/v0.js"></script><script async custom-element="amp-story" src="https://cdn.ampproject.org/v0/amp-story-0.1.js"></script><script async custom-element="amp-video" src="https://cdn.ampproject.org/v0/amp-video-0.1.js"></script><title>My AMP Story</title><meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1"><style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript> <style amp-custom>body {font-family: -apple-system, BlinkMacSystemFont, "Segoe UI ", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji ", "Segoe UI Emoji ", "Segoe UI Symbol ";      }      amp-story-page * {        color: white;        text-align: center;      }      [template=thirds] {        padding: 0;}';
    var wrapeprCustomCSS = $("#custom-css").val();
    var wrapperHTMLPart2 = '</style></head><body><amp-story standalone bookend-config-src="';
    var WrapperHTMLPart3 = '">';
    var wrapperHTMLPart4 = '</amp-story></body>';

    var fullCode = wrapperHTMLPart1 + wrapeprCustomCSS + wrapperHTMLPart2 + bookendBlobURL + WrapperHTMLPart3 + finalHTML + wrapperHTMLPart4;
    var fullExportCode = wrapperHTMLOpen + wrapperHTMLPart1 + wrapeprCustomCSS + wrapperHTMLPart2 + "bookend.json" + WrapperHTMLPart3 + finalHTML + wrapperHTMLPart4 + wrapperHTMLClose;

    $("#code").val(finalHTML);
    $("#full-code").val(fullExportCode);
    $("#bookend-code").val(JSON.stringify(bookend));

    var iframe = document.getElementById('iframe');
    iframe = iframe.contentWindow || ( iframe.contentDocument.document || iframe.contentDocument);

    iframe.document.open();
    iframe.document.write(fullCode);
    iframe.document.close();

    var exportCodeBlob = new Blob([fullExportCode], { type: 'text/html' });
    var exportCodeBlobURL = URL.createObjectURL(exportCodeBlob);

    $(".export-modal-button-html").attr("href", exportCodeBlobURL);
    $(".export-modal-button-html").attr("download", "index.html");

    $(".export-modal-button-bookend").attr("href", bookendBlobURL);
    $(".export-modal-button-bookend").attr("download", "bookend.json");
}

function setUpListeners(){

    $("body").on("click", ".page-add", function(){
    addNewPage();
    });

    $("body").on("click", ".pages .delete-page.delete-button", function(){
        removeRenderPage($(this).attr("data-id"));
    });

    $("body").on("click", ".pages .delete-layer.delete-button", function(){
        var pageID = $(this).parents("[data-id]").parents("[data-id]").attr("data-id");
        removeRenderLayer($(this).attr("data-id"), pageID);
    });

    $("body").on("click", ".pages .delete-component.delete-button", function(){
        var componentID = $(this).parents("[data-id]").attr("data-id");
        var layerID = $(this).parents("[data-id]").parents("[data-id]").attr("data-id");
        var pageID = $(this).parents("[data-id]").parents("[data-id]").parents("[data-id]").attr("data-id"); 
        removeRenderComponent(componentID, layerID, pageID);
    });

    $("body").on("click", ".page .add-layer", function(){
        addNewLayer($(this).parents(".page").attr("data-id"));
    });

    
    $("body").on("click", ".layer .add-from-select", function(){
        var layerID = $(this).parents("[data-id]").attr("data-id");
        var pageID = $(this).parents("[data-id]").parents("[data-id]").attr("data-id"); 
        var componentID = $(this).siblings(".add-select").val();

        console.log("searching for component "+ componentID);
        for(var i=0;i<componentsTemplateList.length;i++){
            var tempalte = componentsTemplateList[i];
            if(tempalte.componentID == componentID){
                addNewComponent(tempalte, pageID, layerID);
            }
        }
    });

    $("body").on("keypress", "input.attribute-input", function(e){
        if(e.which == 13) {
            callUpdateAttribute($(this).attr("data-name"), $(this).val(), $(this).parents("[data-id]").attr("data-id"));
        }
    });

    $("body").on("change", "select.attribute-input", function(){
        callUpdateAttribute($(this).attr("data-name"), $(this).val(), $(this).parents("[data-id]").attr("data-id"));
    });

    $("body").on("click", ".save-css-button", function(){
        updateRender();
    });

}

$(document).ready(function(){
    setUpListeners();

    var startPage = generateNewElement(pageTemplate, {id: (nextElementID++)});
    var startLayer = generateNewElement(layerTemplate, {id: (nextElementID++)});
    var startImage = generateNewElement(imageTemplate, {id: (nextElementID++)});

    addChildToParent(startImage, startLayer);
    addChildToParent(startLayer, startPage);

    currentPages.push(startPage);

    updateRender();
});