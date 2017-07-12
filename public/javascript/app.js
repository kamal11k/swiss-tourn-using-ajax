

$(function(){
    var $createTour = $('.createTour')


    $createTour.on('click',function(event){
        var name = $('.input_tour').val()
        var data = {
                t_name: name
            }
        $.ajax({
            method: 'POST',
            url: '/createTournament',
            data : data,
            success:function(data){
                var html =
                        "<tr><th><a class='tour' href='/individualTournament/"+data.insertId+"'>\
                        "+name+"</a></td><td>Not Started</td><td>Not declared</td></tr>"
                $('tbody').append(html)
            }
        })
    })
})
