(this["webpackJsonpgraph-project-app"]=this["webpackJsonpgraph-project-app"]||[]).push([[0],{11:function(e,t,n){e.exports=n(20)},16:function(e,t,n){},17:function(e,t,n){},20:function(e,t,n){"use strict";n.r(t);var o=n(0),a=n.n(o),r=n(9),s=n.n(r);n(16),n(17);var l=n(6),i=n.n(l),c=n(5),x=n(10),u=n(1),d=n(2),p=n(4),b=n(3),h=(n(8),function(e){return a.a.createElement("button",{className:e.className,onClick:e.onClick,onPointerEnter:e.onPointerEnter,onPointerDown:e.onPointerDown,onPointerUp:e.onPointerUp},e.value)}),v=function(e){Object(p.a)(n,e);var t=Object(b.a)(n);function n(){return Object(u.a)(this,n),t.apply(this,arguments)}return Object(d.a)(n,[{key:"renderBox",value:function(e){var t,n=this,o=this.props.boxContent;return t=o.startBoxIndex===e?"startBox":o.endBoxIndex===e?"endBox":o.resultBoxes.includes(e)?"resultBox":o.wallBoxes.includes(e)?"wallBox":o.transitionBoxes.includes(e)?"transitionBox":o.coveredBoxes.includes(e)?"coveredBox":"box",a.a.createElement(h,{key:e,id:e,className:t,value:this.props.boxContent.box[e],onClick:function(){return n.props.onClick(e)},onPointerDown:function(){return n.props.onPointerDown(e)},onPointerEnter:function(){return n.props.onPointerEnter(e)},onPointerUp:function(){return n.props.onPointerUp(e)}})}},{key:"render",value:function(){var e=this,t=this.props.rows,n=this.props.cols,o=Array(t).fill(null),r=Array(n).fill(null);console.log("boxContent from Grid: ",this.props.boxContent);var s=o.map((function(t,o){return a.a.createElement("div",{className:"grid-row",id:o,key:o},r.map((function(t,a){return e.renderBox(o*n+a)})))}));return a.a.createElement("div",null,s)}}]),n}(o.Component),B=function(e){Object(p.a)(n,e);var t=Object(b.a)(n);function n(e){var o;Object(u.a)(this,n),o=t.call(this,e);var a=Math.floor(window.innerHeight/33);o.wallPointer=!1,o.ROW=a,o.COL=30;var r=Array(30*a).fill(null);return o.state={boxContent:{box:r,startBoxIndex:null,endBoxIndex:null,wallBoxes:[],resultBoxes:[],transitionBoxes:[],coveredBoxes:[],distance:0}},o}return Object(d.a)(n,[{key:"getEdgeBoxes",value:function(e,t,n){var o=this.ROW,a=this.COL,r=Math.floor(e/a),s=e%a,l=[];return 0===r||t[e-a]||(l.push(e-a),t[e-a]=!0,n[e-a]=e),r===o-1||t[e+a]||(l.push(e+a),t[e+a]=!0,n[e+a]=e),0===s||t[e-1]||(l.push(e-1),t[e-1]=!0,n[e-1]=e),s===a-1||t[e+1]||(l.push(e+1),t[e+1]=!0,n[e+1]=e),l}},{key:"boxClick",value:function(e){var t=this.state.boxContent,n=t.box,o=t.startBoxIndex,a=t.endBoxIndex,r=t.distance;if(null===o)this.setState({boxContent:{box:n,startBoxIndex:e,endBoxIndex:null,wallBoxes:this.state.boxContent.wallBoxes,resultBoxes:[],transitionBoxes:[],coveredBoxes:[],distance:r}}),console.log("From BoxClick startBoxIndex = ",this.state);else if(null!==o&&null===a){if(o===e)return;this.setState({boxContent:{box:n,startBoxIndex:o,endBoxIndex:e,wallBoxes:this.state.boxContent.wallBoxes,resultBoxes:[],transitionBoxes:[],coveredBoxes:[],distance:r}}),console.log("From boxClick endBoxIndex = ",this.state)}console.log("From boxClick endline = ",this.state)}},{key:"wallPointerDown",value:function(e){var t=this.state.boxContent,n=t.box,o=t.startBoxIndex,a=t.endBoxIndex,r=t.resultBoxes,s=t.transitionBoxes,l=t.coveredBoxes,i=t.wallBoxes,c=t.distance;if(null!==o&&null!==a){this.wallPointer=!0;var x=i;x.push(e),this.setState({boxContent:{box:n,startBoxIndex:o,endBoxIndex:a,wallBoxes:x,resultBoxes:r,transitionBoxes:s,coveredBoxes:l,distance:c}})}}},{key:"wallPointerUp",value:function(e){this.wallPointer=!1}},{key:"createWall",value:function(e){var t=this.state.boxContent,n=t.box,o=t.startBoxIndex,a=t.endBoxIndex,r=t.resultBoxes,s=t.transitionBoxes,l=t.coveredBoxes,i=t.distance;if(null!==o&&null!==a&&this.wallPointer){var c=this.state.boxContent.wallBoxes;c.push(e),this.setState({boxContent:{box:n,startBoxIndex:o,endBoxIndex:a,wallBoxes:c,resultBoxes:r,transitionBoxes:s,coveredBoxes:l,distance:i}})}}},{key:"buttonStart",value:function(){var e=Object(x.a)(i.a.mark((function e(){var t,n,o,a,r,s,l,x,u,d,p,b,h,v,B,f,m,w,g;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:for(t=this.state.boxContent,n=t.box,o=t.startBoxIndex,a=t.endBoxIndex,r=t.wallBoxes;r.includes(a);)r.splice(r.indexOf(a),1);for(s=[],l=[],x=[],u=0,d=!0,p=this.ROW*this.COL,b=Array(p).fill(!1),h=0;h<r.length;h++)b[r[h]]=!0;v=Array(p).fill(null),b[t.startBoxIndex]=!0,s.push(o),B=[];case 11:if(s.includes(a)){e.next=26;break}for(u++,B=[],f=0;f<s.length;f++)(m=B).push.apply(m,Object(c.a)(this.getEdgeBoxes(s[f],b,v)));if(0!==B.length){e.next=19;break}return d=!1,x.push.apply(x,Object(c.a)(s)),e.abrupt("return");case 19:return x.push.apply(x,Object(c.a)(s)),s=Object(c.a)(B),e.next=23,new Promise((function(e){return setTimeout(e,20)}));case 23:this.setState({boxContent:{box:n,startBoxIndex:o,endBoxIndex:a,wallBoxes:r,resultBoxes:l,transitionBoxes:s,coveredBoxes:x,distance:u}}),e.next=11;break;case 26:if(!d){e.next=37;break}x.push.apply(x,Object(c.a)(s)),w=u,g=v[a];case 29:return l.push(g),e.next=32,new Promise((function(e){return setTimeout(e,20)}));case 32:console.log("currentRBox: ",g),this.setState({boxContent:{box:n,startBoxIndex:o,endBoxIndex:a,wallBoxes:r,resultBoxes:l,coveredBoxes:x,transitionBoxes:[],distance:u}}),g=v[g],w--;case 36:if(0!==w){e.next=29;break}case 37:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"render",value:function(){var e=this,t=this.state.boxContent;return a.a.createElement("div",{className:"graph"},a.a.createElement("div",{className:"graph-grid"},a.a.createElement(v,{rows:this.ROW,cols:this.COL,boxContent:t,onClick:function(t){return e.boxClick(t)},onPointerDown:function(t){return e.wallPointerDown(t)},onPointerEnter:function(t){return e.createWall(t)},onPointerUp:function(t){return e.wallPointerUp(t)}})),a.a.createElement("div",{className:"graph-info"},a.a.createElement("button",{class:"btn btn-primary btn-md",onClick:function(){return e.buttonStart()}},"Start")))}}]),n}(o.Component),f=function(e){Object(p.a)(n,e);var t=Object(b.a)(n);function n(){return Object(u.a)(this,n),t.apply(this,arguments)}return Object(d.a)(n,[{key:"render",value:function(){return a.a.createElement("nav",{class:"navbar navbar-expand-lg navbar-dark bg-dark"},a.a.createElement("a",{class:"navbar-brand",href:"#"},"Navbar"),a.a.createElement("button",{class:"navbar-toggler",type:"button","data-toggle":"collapse","data-target":"#navbarNavDropdown","aria-controls":"navbarNavDropdown","aria-expanded":"false","aria-label":"Toggle navigation"},a.a.createElement("span",{class:"navbar-toggler-icon"})),a.a.createElement("div",{class:"collapse navbar-collapse",id:"navbarNavDropdown"},a.a.createElement("ul",{class:"navbar-nav"},a.a.createElement("li",{class:"nav-item active"},a.a.createElement("a",{class:"nav-link",href:"#"},"Home ",a.a.createElement("span",{class:"sr-only"},"(current)"))),a.a.createElement("li",{class:"nav-item"},a.a.createElement("a",{class:"nav-link",href:"#"},"Features")),a.a.createElement("li",{class:"nav-item"},a.a.createElement("a",{class:"nav-link",href:"#"},"Pricing")),a.a.createElement("li",{class:"nav-item dropdown"},a.a.createElement("a",{class:"nav-link dropdown-toggle",href:"#",id:"navbarDropdownMenuLink","data-toggle":"dropdown","aria-haspopup":"true","aria-expanded":"false"},"Dropdown link"),a.a.createElement("div",{class:"dropdown-menu","aria-labelledby":"navbarDropdownMenuLink"},a.a.createElement("a",{class:"dropdown-item",href:"#"},"Action"),a.a.createElement("a",{class:"dropdown-item",href:"#"},"Another action"),a.a.createElement("a",{class:"dropdown-item",href:"#"},"Something else here"))))))}}]),n}(o.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));n(19);s.a.render(a.a.createElement(a.a.StrictMode,null,a.a.createElement(f,null),a.a.createElement(B,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))},8:function(e,t,n){}},[[11,1,2]]]);
//# sourceMappingURL=main.fc7cacb4.chunk.js.map