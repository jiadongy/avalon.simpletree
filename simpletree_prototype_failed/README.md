#2014.11.10
失败原因：
1.avalonJS本身并没有考虑把方法在实例间共享（可能因为大部分情况确实不必要），<br>
      如在addAssign()判断方法是否存在是用hasOwnPrototpe而不是prop in scopr，编程起来不直观<br>
2.事件触发没法改变上下文的this，如单击时传入的liveClick(this..)是HTML Element，<br>
       因此没法在liveClick内部获得vm的属性和方法（这个没法解决，除非将其重新移入VM中）<br>
