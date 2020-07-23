(this["webpackJsonpgraph-project-app"]=this["webpackJsonpgraph-project-app"]||[]).push([[0],{11:function(e,t,n){e.exports=n(20)},16:function(e,t,n){},17:function(e,t,n){},20:function(e,t,n){"use strict";n.r(t);var a=n(0),s=n.n(a),o=n(9),r=n.n(o);n(16),n(17);var i=n(6),l=n.n(i),c=n(5),u=n(10),d=n(1),x=n(2),p=n(4),h=n(3),f=(n(8),function(e){var t,n=null,a=new String(e.className);return t=e.offsetBool?{width:e.boxSize+e.allBoxOffset+1}:{width:e.boxSize+e.allBoxOffset},a.valueOf()===new String("startBox").valueOf()?n=s.a.createElement("span",{class:"glyphicon glyphicon-move",style:{"font-size":e.allBoxOffset+2+"px"}}):a.valueOf()===new String("endBox").valueOf()&&(n=s.a.createElement("span",{class:"glyphicon glyphicon-record",style:{"font-size":e.allBoxOffset+2+"px"}})),s.a.createElement("button",{style:t,className:e.className,onClick:e.onClick,onPointerEnter:e.onPointerEnter,onPointerDown:e.onPointerDown,onPointerUp:e.onPointerUp},n)}),B=function(e){Object(p.a)(n,e);var t=Object(h.a)(n);function n(){return Object(d.a)(this,n),t.apply(this,arguments)}return Object(x.a)(n,[{key:"renderBox",value:function(e,t){var n,a=this,o=Math.floor(this.props.sizeOffset/this.props.cols),r=t<this.props.sizeOffset%this.props.cols-1,i=this.props.boxContent;return n=i.startBoxIndex===e?"startBox":i.endBoxIndex===e?"endBox":i.resultBoxes.includes(e)?"resultBox":i.wallBoxes.includes(e)?"wallBox":i.transitionBoxes.includes(e)?"transitionBox":i.coveredBoxes.includes(e)?"coveredBox":"box",s.a.createElement(f,{key:e,id:e,boxSize:this.props.boxSize,allBoxOffset:o,offsetBool:r,className:n,value:this.props.box[e],onClick:function(){return a.props.onClick(e)},onPointerDown:function(){return a.props.onPointerDown(e)},onPointerEnter:function(){return a.props.onPointerEnter(e)},onPointerUp:function(){return a.props.onPointerUp(e)}})}},{key:"render",value:function(){var e=this,t=this.props.rows,n=this.props.cols,a=Array(t).fill(null),o=Array(n).fill(null),r=a.map((function(t,a){return s.a.createElement("div",{className:"grid-row",id:a,key:a},o.map((function(t,s){return e.renderBox(a*n+s,s)})))}));return s.a.createElement("div",null,r)}}]),n}(a.Component),m=function(e){Object(p.a)(n,e);var t=Object(h.a)(n);function n(e){var a;Object(d.a)(this,n);(a=t.call(this,e)).BOXSIZE=5;a.wallPointer=!1;var s=Array(1250).fill(null);return a.state={box:s,boxContent:{startBoxIndex:null,endBoxIndex:null,wallBoxes:[],resultBoxes:[],transitionBoxes:[],coveredBoxes:[],distance:0},status:"Please select your starting node.",row:25,col:50,sizeOffset:0,inProgress:!1,reset:!1,speedTimer:40},a}return Object(x.a)(n,[{key:"componentDidMount",value:function(){window.addEventListener("resize",this.resize.bind(this)),this.resize()}},{key:"resize",value:function(){var e=window.innerWidth-(this.BOXSIZE-1)*this.state.col;this.setState({sizeOffset:e})}},{key:"componentWillUnmount",value:function(){window.removeEventListener("resize",this.resize.bind(this))}},{key:"getEdgeBoxes",value:function(e,t,n){var a=this.state.row,s=this.state.col,o=Math.floor(e/s),r=e%s,i=[];return 0===o||t[e-s]||(i.push(e-s),t[e-s]=!0,n[e-s]=e),o===a-1||t[e+s]||(i.push(e+s),t[e+s]=!0,n[e+s]=e),0===r||t[e-1]||(i.push(e-1),t[e-1]=!0,n[e-1]=e),r===s-1||t[e+1]||(i.push(e+1),t[e+1]=!0,n[e+1]=e),i}},{key:"boxClick",value:function(e){if(!this.state.inProgress){this.setState({reset:!1,inProgress:!1});var t=this.state.boxContent,n=t.startBoxIndex,a=t.endBoxIndex,s=t.distance;if(null===n)this.setState({boxContent:{startBoxIndex:e,endBoxIndex:null,wallBoxes:this.state.boxContent.wallBoxes,resultBoxes:[],transitionBoxes:[],coveredBoxes:[],distance:s},status:"Now please select you ending or target node."});else if(null!==n&&null===a){if(n===e)return;this.setState({boxContent:{startBoxIndex:n,endBoxIndex:e,wallBoxes:this.state.boxContent.wallBoxes,resultBoxes:[],transitionBoxes:[],coveredBoxes:[],distance:s},status:"Drag or Click node to create a wall (weight = infinity)"})}}}},{key:"wallPointerDown",value:function(e){if(!this.state.inProgress){var t=this.state.boxContent,n=t.startBoxIndex,a=t.endBoxIndex,s=t.resultBoxes,o=t.transitionBoxes,r=t.coveredBoxes,i=t.wallBoxes,l=t.distance;if(null!==n&&null!==a){this.wallPointer=!0;var c=i;c.push(e),this.setState({boxContent:{startBoxIndex:n,endBoxIndex:a,wallBoxes:c,resultBoxes:s,transitionBoxes:o,coveredBoxes:r,distance:l}})}}}},{key:"wallPointerUp",value:function(e){this.state.inProgress||(this.wallPointer=!1)}},{key:"createWall",value:function(e){if(!this.state.inProgress){var t=this.state.boxContent,n=t.startBoxIndex,a=t.endBoxIndex,s=t.resultBoxes,o=t.transitionBoxes,r=t.coveredBoxes,i=t.distance;if(null!==n&&null!==a&&this.wallPointer){var l=this.state.boxContent.wallBoxes;l.push(e),this.setState({boxContent:{startBoxIndex:n,endBoxIndex:a,wallBoxes:l,resultBoxes:s,transitionBoxes:o,coveredBoxes:r,distance:i}})}}}},{key:"startButton",value:function(){var e=Object(u.a)(l.a.mark((function e(){var t,n,a,s,o,r,i,u,d,x,p,h,f,B,m,b,v,g,w=this;return l.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(!this.state.inProgress){e.next=4;break}return e.abrupt("return");case 4:this.setState({reset:!1});case 5:if(t=this.state.boxContent,n=t.startBoxIndex,a=t.endBoxIndex,null!==n){e.next=11;break}return this.setState({status:"Please select the starting and target node before searching."}),e.abrupt("return");case 11:if(null!==a){e.next=16;break}return this.setState({status:"Please select the target node before searching."}),e.abrupt("return");case 16:this.setState({status:"Search in Progress, Have Fun!",inProgress:!0});case 17:for(s=t.wallBoxes;s.includes(a);)s.splice(s.indexOf(a),1);for(o=[],r=[],i=[],u=0,d=!0,x=this.state.row*this.state.col,p=Array(x).fill(!1),h=0;h<s.length;h++)p[s[h]]=!0;f=Array(x).fill(null),p[t.startBoxIndex]=!0,o.push(n),B=[];case 27:if(o.includes(a)){e.next=43;break}for(u++,B=[],m=0;m<o.length;m++)(b=B).push.apply(b,Object(c.a)(this.getEdgeBoxes(o[m],p,f)));if(0!==B.length){e.next=36;break}return d=!1,i.push.apply(i,Object(c.a)(o)),this.setState({status:"No path found, shortest distance is infinity. Click reset to retry.",inProgress:!1}),e.abrupt("return");case 36:return i.push.apply(i,Object(c.a)(o)),o=Object(c.a)(B),e.next=40,new Promise((function(e,t){w.state.reset?w.setState({boxContent:{startBoxIndex:null,endBoxIndex:null,wallBoxes:[],resultBoxes:[],transitionBoxes:[],coveredBoxes:[],distance:0},status:"Please select your starting node.",inProgress:!1,reset:!0}):setTimeout(e,w.state.speedTimer)}));case 40:this.setState({boxContent:{startBoxIndex:n,endBoxIndex:a,wallBoxes:s,resultBoxes:r,transitionBoxes:o,coveredBoxes:i,distance:u}}),e.next=27;break;case 43:if(!d){e.next=54;break}i.push.apply(i,Object(c.a)(o)),v=u,g=f[a];case 46:return r.push(g),e.next=49,new Promise((function(e,t){w.state.reset?w.setState({boxContent:{startBoxIndex:null,endBoxIndex:null,wallBoxes:[],resultBoxes:[],transitionBoxes:[],coveredBoxes:[],distance:0},status:"Select your starting node.",inProgress:!1,reset:!0}):setTimeout(e,w.state.speedTimer)}));case 49:this.setState({boxContent:{startBoxIndex:n,endBoxIndex:a,wallBoxes:s,resultBoxes:r,coveredBoxes:i,transitionBoxes:[],distance:u}}),g=f[g],0===--v&&this.setState({inProgress:!1,status:"Here is the required shortest path, click reset to retry."});case 53:if(0!==v){e.next=46;break}case 54:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"resetButton",value:function(){this.state.inProgress?this.setState({inProgress:!1,reset:!0}):this.setState({boxContent:{startBoxIndex:null,endBoxIndex:null,wallBoxes:[],resultBoxes:[],transitionBoxes:[],coveredBoxes:[],distance:0},status:"Please select your starting node.",inProgress:!1,reset:!1})}},{key:"render",value:function(){var e=this,t=this.state.boxContent;return s.a.createElement("div",{className:"graph"},s.a.createElement("div",{className:"graph-info"},s.a.createElement("div",{className:"nodeInfo"},s.a.createElement("ul",null,s.a.createElement("li",{className:"first"},s.a.createElement("button",{class:"startBox",style:{border:"transparent",animation:"none"}},s.a.createElement("span",{class:"glyphicon glyphicon-move"})),"Starting Node"),s.a.createElement("li",null,s.a.createElement("button",{className:"endBox",style:{border:"transparent",animation:"none"}},s.a.createElement("span",{class:"glyphicon glyphicon-record"})),"Ending/Target Node"),s.a.createElement("li",null,s.a.createElement("box",{className:"box",style:{border:"transparent",animation:"none"}}),"Empty Node"),s.a.createElement("li",null,s.a.createElement("box",{className:"coveredBox",style:{border:"transparent",animation:"none"}}),"Covered Node"),s.a.createElement("li",null,s.a.createElement("box",{className:"resultBox",style:{border:"transparent",animation:"none"}}),"Result Path Node")),s.a.createElement("button",{class:"btn btn-primary btn-md",onClick:function(){return e.startButton()},disabled:this.state.inProgress},"Search Path"),s.a.createElement("button",{class:"btn btn-warning btn-md",onClick:function(){return e.resetButton()},style:{marginLeft:"20px"}},"Reset")),s.a.createElement("div",{className:"status"},this.state.status)),s.a.createElement("div",{className:"graph-grid"},s.a.createElement(B,{box:this.state.box,rows:this.state.row,cols:this.state.col,boxSize:this.BOXSIZE,sizeOffset:this.state.sizeOffset,boxContent:t,onClick:function(t){return e.boxClick(t)},onPointerDown:function(t){return e.wallPointerDown(t)},onPointerEnter:function(t){return e.createWall(t)},onPointerUp:function(t){return e.wallPointerUp(t)}})))}}]),n}(a.Component),b=function(e){Object(p.a)(n,e);var t=Object(h.a)(n);function n(){return Object(d.a)(this,n),t.apply(this,arguments)}return Object(x.a)(n,[{key:"render",value:function(){return s.a.createElement("nav",{class:"navbar navbar-expand-lg navbar-dark bg-dark ",style:{margin:"0px","border-radius":"0px"}},s.a.createElement("a",{class:"navbar-brand",href:"#"},"Dijkstra's Algorithm Visual"),s.a.createElement("button",{class:"navbar-toggler",type:"button","data-toggle":"collapse","data-target":"#navbarNavDropdown","aria-controls":"navbarNavDropdown","aria-expanded":"false","aria-label":"Toggle navigation"},s.a.createElement("span",{class:"navbar-toggler-icon"})),s.a.createElement("div",{class:"collapse navbar-collapse",id:"navbarNavDropdown"},s.a.createElement("ul",{class:"navbar-nav"},s.a.createElement("li",{class:"nav-item active"},s.a.createElement("a",{class:"nav-link",href:"#"},"Home ",s.a.createElement("span",{class:"sr-only"},"(current)"))),s.a.createElement("li",{class:"nav-item"},s.a.createElement("a",{class:"nav-link",href:"#"},"(UnderConstruction) Features")),s.a.createElement("li",{class:"nav-item"},s.a.createElement("a",{class:"nav-link",href:"#"},"(UnderConstruction) Have Your Own Graph?")),s.a.createElement("li",{class:"nav-item dropdown"},s.a.createElement("a",{class:"nav-link dropdown-toggle",href:"#",id:"navbarDropdownMenuLink","data-toggle":"dropdown","aria-haspopup":"true","aria-expanded":"false"},"(UnderConstruction) Dropdown"),s.a.createElement("div",{class:"dropdown-menu","aria-labelledby":"navbarDropdownMenuLink"},s.a.createElement("a",{class:"dropdown-item",href:"#"},"Action"),s.a.createElement("a",{class:"dropdown-item",href:"#"},"Another action"),s.a.createElement("a",{class:"dropdown-item",href:"#"},"Something else here"))))))}}]),n}(a.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));n(19);r.a.render(s.a.createElement(s.a.StrictMode,null,s.a.createElement(b,null),s.a.createElement(m,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))},8:function(e,t,n){}},[[11,1,2]]]);
//# sourceMappingURL=main.4f20b83d.chunk.js.map