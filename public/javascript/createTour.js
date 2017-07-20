$(function(){
    var $createTour = $('.createTour');

    function hasTournaments(){
        $.ajax({
            method: 'GET',
            url: '/hasTournaments',
            success: function(data){
                if(data.msg)
                     $('.tour_table').show()
                 else
                    $('.message').show()
            }
        })
    }
    hasTournaments();

    $createTour.on('click',function(event){
        var name = $('.input_tour').val()
        if(name=='')
            $('.input_tour').notify(
                "Name Required",{ position:"top" }
            )
        else {
            var data = {
                    t_name: name
                }
            $.ajax({
                method: 'POST',
                url: '/createTournament',
                data : data,
                success:function(data){
                    if(data.msg){
                        $('.input_tour').val('');
                        $('.input_tour').notify(
                              data.msg,{ position:"top" }
                            );
                    }
                    else{
                        $('.message').css("display", "none");
                        $('.tour_table').show();
                        var id = data.data.insertId;
                        $('.input_tour').val('')
                        var html =
                                "<tr><th><a class='tour' href='/individualTournament/"+id+"'>\
                                "+name+"</a></td><td>Not Started</td><td>Not declared</td></tr>"
                        $('tbody').append(html)
                    }
                }
            })
        }
    })
})
