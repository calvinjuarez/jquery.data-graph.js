/*
 * data-graph.js
 * ====================================================================
 * @author: Calvin Juárez
 */



+function ($) {

	var Graph = function (element, options) {
		this.options  = $.extend({}, Graph.DEFAULTS, options)
		this.$element = $(element)
		this.type     = Graph.TYPES[this.options.type] || this.options.type || Graph.TYPES.bar
		this.rubric   = this.options.rubric ? Graph.RUBRICS[this.options.rubric] || this.options.rubric || Graph.RUBRICS.quality : false
		
		if (this.options.scale === '%') this.options.scale = 100
		this.$element.addClass(this.type.className)
		
		return this.draw()
	}
	
	Graph.DEFAULTS = {
		  scale  : 10            // numeric values or "%"; defaults to 10; "%" is an alias for 100
		, type   : 'bar'         // a type or a custom type object; defaults to 'bar'
		, rubric : 'proficiency' // a rubric name, an array of grades (low to high), or false; defaults to 'proficiency'
		, legend : false         // a boolean; defaults to false
	}
	
	Graph.TYPES = {
		  bar: {
			  name      : 'bar'
			, className : 'graph graph-bar'
			, template  : $('#bar-template')[0] ?
				  $('#bar-template').html()
				: '<div class="item bar bar-{{index}} grade-{{grade.index}}" style="width:{{percent}}%;" title="{{grade.name}}"><span class="label">{{text}}</span></div>'
		}
	}
	
	Graph.RUBRICS = {
		  proficiency : ['limited','beginner','comfortable','proficient','very proficient'] // 5 Grades
		, quality     : ['poor','fair','good','great','excellent']                          // 5 Grades
		, schoolBasic : ['F','D','C','B','A']																// 5 Grades
		, schoolPlus  : ['F','D-','D','D+','C-','C','C+','B-','B','B+','A-','A','A+']			// 13 Grades
	}
	
	Graph.prototype.getItems = function () {
		var scale  = this.options.scale
		var rubric = this.rubric
		var items  = []
		
		this.$element.find('[data-value]').each(function (i,v) {
			var $item = $(v)
			var item = {}
			
			item.index    = i + 1
			item.tag      = 'div'
			item.text     = $item.text().trim()
			item.value    = $item.data('value')
			item.percent  = $item.data('value') / scale * 100
			
			if (rubric) {
				item.grade = {}
				item.grade.index = Math.floor(item.percent / (100 / rubric.length))
				item.grade.name  = toTitleCase.call(rubric[item.grade.index - 1])
					.replace(/-/g,'-minus')
					.replace(/\+/g,'-plus')
			}
			
			if ($item.find('a')[0]) {
				item.tag   = 'a'
				item.href  = $item.find('a')[0] ? $item.find('a').attr('href') : null
			}
			
			items[i] = item
		})
		
		return items
		
		function toTitleCase() {
			return this.replace(/\w\S*/g, function (txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
			})
		}
	}
	
	Graph.prototype.draw = function () {
		var items    = this.getItems()
		var template = this.type.template
		
		Mustache.parse(template)
		
		this.$element.find('[data-value]').each(function (i,item) {
			$(item).html(Mustache.render(template,items[i]))
		})
		
		if (this.options.legend)
			this.$element.after(this.getLegend())
		
		return this
	}
	
	Graph.prototype.getLegend = function () {
		var $legend = $('<aside class="legend"></aside>')
		
		$legend.append($('<ul class="legend-content"></ul>'))
		$.each(this.rubric, function (i,grade) {
			$legend.find('.legend-content')
				.append($('<li><i class="swatch grade-' + i + '"></i><span class="label">' + grade + '</span></li>'))
		})
		
		return $legend
	}


	// GRAPH PLUGIN DEFINITION
	// =======================

	var old = $.fn.graph

	$.fn.graph = function (option) {
		return this.each(function () {
			var $this   = $(this)
			var data    = $this.data('graph')
			var options = typeof option === 'object' && option

			if (!data) $this.data('graph', (data = new Graph(this, options)))
			if (typeof option === 'string') data[option]()
		})
	}

	$.fn.graph.Constructor = Graph


	// GRAPH NO CONFLICT
	// =================

	$.fn.graph.noConflict = function () {
		$.fn.graph = old
		return this
	}


	// GRAPH DATA-API
	// ==============

	$(window).on('load', function () {
		$('[data-draw="graph"]').each(function () {
			var $graph = $(this)
			var data = $graph.data()
			$graph.graph(data)
		})
	})

}(jQuery);