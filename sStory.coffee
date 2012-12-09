sections = {}

makeTimeline = (d,i) ->
	timelineoptions = {
		type:       'timeline'
		width:      '100%'
		height:     '620'
		source:     d.url
		embed_id:   'timeline'+i
	}
	$(document).ready(->
	    createStoryJS(timelineoptions)
	)

makeTributary = (element, gistID) ->

    $.ajax({
        url: "https://api.github.com/gists/"+gistID,
        cache: false
    })
    .done((gist) ->

        console.log "GISTY", gist
        snippet = gist.files['inlet.js'].content;
        #readme = gist.files['README'].content;

        #readme_firstline = readme.split('\n')[0].substring(1);

        #readme = gist.files['README'].content.split('\n').splice(1,2).join('\n');

        snippet_data = {
            gist_url: gist.html_url,
            code: snippet
        }

        snippetHTML = ich.snippet(snippet_data);

        $('#snippets').append(snippetHTML);


        codefile = $(element+' .code').text();
        display_div = d3.select(element+' .example');
        editor_div = d3.select(element+' .editor');
        $(element+' .code').hide();

        tb = Tributary();
        render = "svg";
        config = new tb.Config({display: render});
        model = new tb.CodeModel({code: codefile});

        tribcont = new tb.TributaryContext({
        config: config,
        model: model,
        el: display_div.node()
        })
        tribcont.render();
        tribcont.execute();

        editor = new tb.Editor({
        model: model,
        el: editor_div.node()
        });
        editor.render();
    )




makeNavbar = (sections) ->
    sectioncount = 0
    nav_sections = sections

    for section in nav_sections
        sectioncount++

        section.count = sectioncount
        if section.title isnt undefined
            # Remove any HTML from the title
            section.title = section.title.replace(/<(?:.|\n)*?>/gm, '');
        else
            title = "No title"

        $("#nav").append($(ich.navbarsection(section)))

    $("#nav-expand").on('click', () ->
        console.log 'clicked'
        if $("#nav").hasClass("nav-expanded")
            $("#nav").removeClass("nav-expanded")
        else
            $("#nav").addClass("nav-expanded")
    )


    $("#nav-expand").hoverIntent({
        sensitivity: 2
        interval: 120
        timeout: 200
        over: ->
            if $("#nav").hasClass("nav-expanded")
                $("#nav").removeClass("nav-expanded")
            else
                $("#nav").addClass("nav-expanded")
        })




makeOpenGraph = (sections) ->
    # Use the first image in the story for the opengraph image
    # We also use it's title for the opengraph title
    for section in sections
        if section.type is 'image' or section.type is 'image2' or section.type is 'image3'
            $("head").prepend($('<meta />').attr("property", "og:title").attr("content", section.title))
            $("head").prepend($('<meta />').attr("property", "og:image").attr("content", section.url))
            return true
        else
            return false

makeBuilder = (sections) ->
    builder = d3.select("#section-summary ol")

    sectionli = builder.selectAll('.section-summary-item')
    .data(sections)
    .enter().append("li")
        .attr("class", "section-summary-item")
#        .text((d,i) -> i)

    summaryheader = sectionli.append("div").attr("class", "summary-header")
    summaryheader.append("h4").text((d,i) ->
        if d.title isnt undefined
            d.title
        else
            "> No title given."
    )
    summaryheader.append("div").attr("class", "sectiontype").text((d,i) -> d.type)

    summarycontent = sectionli.append("div").attr("class", "summary-content")
    summarycontent.append("div").attr("class", "image-url").text((d,i) -> d.url)
#    summarycontent.append("div").attr("class", "sectiontext").text((d,i) -> d.caption)

correctInputs = ->
    switch $('#type').val()
        when "image"
            $('#embed-wrapper').hide()
            $('#caption').hide()
            $('#url-wrapper').show();
        when "image2"
            $('#embed-wrapper').hide()
            $('#caption').show()
            $('#url-wrapper').show()
            $('#caption').attr("rows", 2)
        when "image3"
            $('#embed-wrapper').hide()
            $('#caption').show()
            $('#url-wrapper').show();
            $('#caption').attr("rows", 5)
        when "vimeo"
            $('#embed-wrapper').hide()
            $('#caption').show()
            $('#url-wrapper').show();
        when "soundcloud"
            $('#embed-wrapper').show()
            $('#caption').hide()
            $('#url-wrapper').hide();
        when "timeline"
            $('#embed-wrapper').hide()
            $('#caption').hide()
            $('#url-wrapper').show();
        when "text"
            $('#embed-wrapper').hide()
            $('#caption').show()
            $('#url-wrapper').hide();

getJsonCode = ->
    $('#json-code').val(JSON.stringify(sections)).show()

submitNewSection = ->
    section = {}

    $("#error-bar").html("").css("opacity", 0);

    section.title = $("#add-section #title").val();
    section.url = $("#add-section #url").val();
    section.caption = $("#add-section #caption textarea").val();
    section.type = $("#add-section #type").val();
    section.embed = $("#add-section #embed").val();

    console.log "New #{section.type} section", section



    if section.title is ""
        $("#error-bar").html("Every section needs a title, could you add one?").css("opacity", 1)
        return false
    else if section.url is "" and section.type isnt "text"
        $("#error-bar").html("Looks like you forgot to add the URL.").css("opacity", 1)
        return false
    else if section.type is "image2" and section.caption is ""
        $("#error-bar").html("This section type needs a caption.").css("opacity", 1)
        return false
    else if section.type is "image3" and section.caption is ""
        $("#error-bar").html("This section type needs a caption.").css("opacity", 1)
        return false
    else if section.type is "text" and section.caption is ""
        $("#error-bar").html("I think you may have forgotten your text!").css("opacity", 1)
        return false

    if section.type is "image" or section.type is "image2" or section.type is "image3"
        sections.push({
            title: section.title
            type: section.type
            url: section.url
            caption: section.caption
            })
    else if section.type is "vimeo"
        sections.push({
            title: section.title
            type: section.type
            url: section.url
            caption: section.caption
        })
    else if section.type is "soundcloud"
        sections.push({
            title: section.title
            type: section.type
            embed: section.embed
        })
    else if section.type is "text"
        sections.push({
            title: section.title
            type: section.type
            text: section.caption
        })

    $("#container").html("");
    $("#section-summary ol").html("");
    sStory(sections)
    makeBuilder(sections)


sStory = (sections) ->
    makeOpenGraph(sections)
    makeBuilder(sections)
    makeNavbar(sections)

    container = d3.select("#container")
    container.selectAll('.section')
    .data(sections)
    .enter().append("div")
        .attr("id", (d,i) -> "section-"+(i+1))
        .attr("class", (d,i) ->
	 			return "section "+d.type+" "+d.type+i
				)
        .html((d,i) ->
            switch d.type
                when "text"
                    html = ich.text(d, true)
                when "image"
                    html = ich.image(d, true)
                when "image2"
                    html = ich.image2(d, true)
                when "image3"
                    html = ich.image3(d, true)
                when "vimeo"
                    html = ich.vimeo(d, true)
                when "soundcloud"
                    html = ich.soundcloud(d, true)
                when "map"
                    console.log "map"
                when "timeline"
                    html = "<h2>"+d.title+"</h2> "
                    html += "<div id='timeline"+i+"'></div>"
                    makeTimeline(d,i)
                    console.log "timeline"

            return html
        )
				.style("background-image", (d,i) ->
				    if d.type is "image" or d.type is "image2" or d.type is "image3"
					    return "url('"+d.url+"')"
				)

    scrollorama = $.scrollorama({
        blocks: '.section',
        enablePin: false
    });

    $("#nav a:first").addClass("current-section")

    scrollorama.onBlockChange(() ->
            i=scrollorama.blockIndex;
            console.log(i);

            $("#nav a").removeClass("current-section")
            $("#nav-section-"+(i+1)).addClass("current-section")
    );
