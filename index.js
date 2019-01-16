const Viva = require('vivagraphjs')


// Tamanho dos nós e padding
var NodeSize = 48;
var NodeLabelSize = 16;
var NodePadding = 5;

const linksys = {
	Renderer: null,
	Layout: null,
	Geom: Viva.Graph.geom(),
	Graph: Viva.Graph.graph(),
	Graphics: Viva.Graph.View.svgGraphics().node(newNode).placeNode(updateNode).link(newLink).placeLink(updateLink),

	init: (div_id) => {
		linksys.Layout = Viva.Graph.Layout.forceDirected(linksys.Graph, {
					        springLength : 200,
					        springCoeff : 0.0004,
					        dragCoeff : 0.03,
					        gravity : -1.9
					    })

		linksys.Renderer = Viva.Graph.View.renderer(linksys.Graph, {
				            layout   : linksys.Layout,
				            graphics : linksys.Graphics,
				            container: document.getElementById(div_id)
				        });

		linksys.Renderer.run();
	},

	addNode: (node) => {
        linksys.Graph.beginUpdate()
        linksys.Graph.addNode(node.id, node.data)
        linksys.Graph.endUpdate()
	},

	addLink: (node1, node2, data) => {
    linksys.Graph.beginUpdate()
		linksys.Graph.addLink(node1.id, node2.id, {id: data.id, label: data.label, count: data.count});
    linksys.Graph.endUpdate()
	},

  loadFromJson: (json) => {
    let serializer = Viva.Graph.serializer()
    let graph_loaded = serializer.loadFromJSON(json)

    graph_loaded.forEachNode((node)=> {
      linksys.addNode(node)
    })

    graph_loaded.forEachLink((link)=> {
      linksys.graph.addLink(link.fromId, link.toId, link.data)
    })
  }
}

function newNode(node)
{
	let ui = Viva.Graph.svg('g') // Agrupamento dos elementos
    let id = node.id // ID do nó
    ui.attr('data-nodeId', id)
    ui.attr('class', 'node '+ node.data.type)


    svgText = Viva.Graph.svg('text').attr('text-anchor', 'middle').attr('y', '+'+ (NodeSize + NodeLabelSize) +'px').text(node.data.label) // Label da imagem
    img = Viva.Graph.svg('image')
         .attr('width', NodeSize) // Largura da imagem
         .attr('height', NodeSize) // Altura da imagem 
         .attr('x', (NodeSize / 2) * -1 +'px') // Centralizando a imagem no meio
         .link(node.data.icon) // node.data holds custom object passed to graph.addNode();

    ui.append(svgText)
    ui.append(img)

    return ui
}

function updateNode(nodeUi, pos)
{
	// Shift image to let links go to the center:
    nodeUi.attr('transform',
      'translate(' +
            (pos.x - NodeSize/2) + ',' + (pos.y - NodeSize/2) +
      ')');
}

function newLink(link)
{
	// Agrupador
    let ui = Viva.Graph.svg('g');


    ui.attr('id', link.data.id);

    var linha1 = Viva.Graph.svg('path')
      .attr('countId', link.data.count)
      .attr('stroke', 'gray')
      .attr('id', link.data.id + '_1');

    var linha2 = Viva.Graph.svg('path')
      .attr('countId', link.data.count)
      .attr('stroke', 'gray')
      .attr('id', link.data.id + '_2');

    var linha3 = Viva.Graph.svg('path')
      .attr('countId', link.data.count)
      .attr('stroke', 'gray')
      .attr('marker-end', 'url(#Triangle)')
      .attr('id', link.data.id + '_3');


      ui.append(linha1);
      ui.append(linha2);
      ui.append(linha3);


    if (link.data.hasOwnProperty('label'))
    {    
      var label = Viva.Graph.svg('text').attr('id','label_'+link.data.id).attr('fill','grey').text(link.data.label);
      var label_background = Viva.Graph.svg('rect').attr('id', 'background_label_'+link.data.id).attr('fill','white').attr('stroke', 'white');
      ui.append(label_background);
      ui.append(label);
    }

    return ui;
}

function updateLink(linkUI, fromPos, toPos)
{
        var linha1 = linkUI.childNodes[0].getAttribute('countId');
        var linha2 = linkUI.childNodes[1].getAttribute('countId');
        var linha3 = linkUI.childNodes[2].getAttribute('countId');

        // Centralizando o link
        fromPos.x = fromPos.x - (NodeSize / 2);
        toPos.x = toPos.x - (NodeSize / 2);

        var toNodeSize = NodeSize,
        fromNodeSize = NodeSize;
        // var toNodeSize = (NodeSize / 2) * -1,
        // fromNodeSize = (NodeSize / 2) * -1;

        var from = linksys.Geom.intersectRect(
            fromPos.x - fromNodeSize / 2 - NodePadding, // left
            fromPos.y - fromNodeSize / 2 - NodePadding, // top
            fromPos.x + fromNodeSize / 2 + NodePadding, // right
            fromPos.y + fromNodeSize / 2 + NodeLabelSize + NodePadding, // bottom
            fromPos.x, fromPos.y, toPos.x, toPos.y)
        || fromPos;

        var to = linksys.Geom.intersectRect(
            toPos.x - toNodeSize / 2 - NodePadding, // left
            toPos.y - toNodeSize / 2 - NodePadding, // top
            toPos.x + toNodeSize / 2 + NodePadding, // right
            toPos.y + toNodeSize / 2 + NodeLabelSize + NodePadding, // bottom
            // segment:
            toPos.x, toPos.y, fromPos.x, fromPos.y)
            || toPos;

        // Calculando o angulo entre os nos
        let ang_rad = Math.atan2(to.y - from.y,to.x - from.x);
        let ang_complementar_rad = (Math.PI/2) + (ang_rad);

        let distancia = Math.pow(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2), 0.5);


    // Calculo da posicao inicial e final das linhas
      // linha 1
      let path_base = basePath(from,to);
      
	if (linha1 > 0)
	{
        let path = otherPath(path_base[0], path_base[2].end, linha1);

      // Atualizando a posicao das linhas
          linkUI.childNodes[0].attr("d", stringPos(path[0]));
          linkUI.childNodes[1].attr("d", stringPos(path[1]));
          linkUI.childNodes[2].attr("d", stringPos(path[2]));

          var entry = document.getElementById('label_'+linkUI.attr('id'));
        if (entry != null)
        {
          var label = entry.getBBox();
          entry.attr("x", ((path[1].start.x + path[1].end.x) / 2) - label.width / 2 );
          entry.attr("y", ((path[1].start.y + path[1].end.y) / 2) + 4 );

          var background_label = document.getElementById('background_label_'+linkUI.attr('id'));
          background_label.attr('width', label.width+4);
          background_label.attr('height', label.height+2);
          background_label.attr('x', label.x-1);
          background_label.attr('y', label.y-2);
        }

	}
	else
	{

      // Atualizando a posicao das linhas
          linkUI.childNodes[0].attr("d", stringPos(path_base[0]));
          linkUI.childNodes[1].attr("d", stringPos(path_base[1]));
          linkUI.childNodes[2].attr("d", stringPos(path_base[2]));

          var entry = document.getElementById('label_'+linkUI.attr('id'));
        if (entry != null)
        {
          var label = entry.getBBox();
          entry.attr("x", ((path_base[1].start.x + path_base[1].end.x) / 2) - label.width / 2 );
          entry.attr("y", ((path_base[1].start.y + path_base[1].end.y) / 2) + 4 );

          var background_label = document.getElementById('background_label_'+linkUI.attr('id'));
          background_label.attr('width', label.width+4);
          background_label.attr('height', label.height+2);
          background_label.attr('x', label.x-1);
          background_label.attr('y', label.y-2);
        }

  	}
}

function stringPos(path)
{
	return 'M' + path.start.x + ',' + path.start.y +
          'L' + path.end.x + ',' + path.end.y;
}

// Funcao responsavel por montar vinculo extras
function otherPath(from, to, count)
{
	let ang_rad = angleRad(from.start,to);
	let ang_complementar_rad = (Math.PI/2) + (ang_rad);
	let distancia = distTwoPoints(from.start,to);
	let sinal = count;
	let path = [];

	var count_teste = parseInt(count);

	if (count % 2 == 0)
	{
	  count_teste = count_teste / 2;
	}
	else
	{
	  count_teste = (count_teste + 1) / 2;
	}


	path.push({
	  start: {x: from.start.x, y: from.start.y},
	  end: {x: from.end.x + (Math.pow(-1, sinal) * (20 * count_teste) * Math.cos(ang_complementar_rad)), y: from.end.y + (Math.pow(-1, sinal) * (20 * count_teste) * Math.sin(ang_complementar_rad))}
	});

	path.push({
	  start: {x: path[0].end.x, y: path[0].end.y},
	  end: {x: path[0].end.x + ((distancia*0.8) * Math.cos(ang_rad)), y: path[0].end.y + ((distancia*0.8) * Math.sin(ang_rad))}
	});


	path.push({
	  start: path[1].end,
	  end: {x: to.x, y: to.y}
	});

	return path;
}

// Função responsavel por calcular posicao da primeira reta
function basePath(from, to)
{
	let ang_rad = angleRad(from,to);
	let distancia = distTwoPoints(from,to);

	let path = [];

	path.push({
	  start: from,
	  end: projPoint(from, distancia, 0.1, ang_rad)
	});

	path.push({
	  start: path[0].end,
	  end: projPoint(path[0].end, distancia, 0.8, ang_rad)
	});

	path.push({
	  start: path[1].end,
	  end: projPoint(path[1].end, distancia, 0.1, ang_rad)
	});

	return path;
}

// funcao responsavel por calcular o angulo (em radianos)
function angleRad(from,to)
{
	return Math.atan2(to.y - from.y, to.x -  from.x);
}

// funcao responsavel por calcular a distancia dos pontos
function distTwoPoints(from, to)
{
	return Math.pow(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2), 0.5);
}

// calcula projecao
function projPoint(inicio, distancia, percent, angle)
{
	return {x: inicio.x + ((distancia * percent) * Math.cos(angle)), y: inicio.y + ((distancia * percent) * Math.sin(angle))};
}

window['linksys'] = linksys

module.exports = linksys