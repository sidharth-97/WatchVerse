


  function printTable() {
    var table = document.getElementById("downloadTable");
    table.hidden = false;

    var newWin = window.open('', 'Print-Window');
    newWin.document.open();

    // Add necessary CSS styles for the table
    newWin.document.write('<html><head><style>');
    newWin.document.write('table { border-collapse: collapse; width: 100%; }');
    newWin.document.write('table, th, td { border: 1px solid black; }');
    newWin.document.write('</style></head><body onload="window.print()">');

    // Write the table HTML
    newWin.document.write(table.outerHTML);

    newWin.document.write('</body></html>');
    newWin.document.close();

    setTimeout(function () { newWin.close(); }, 10);
    table.hidden = true;
  }
  $(document).ready(function () {
    $('#downloadTable').DataTable();
  });


  function exportReportToExcel() {
    // Include the SheetJS library


    // Get the table element
    const table = document.getElementById("downloadTable");
    document.getElementById("downloadTable").hidden = false

    // Convert the table to a workbook
    const workbook = XLSX.utils.table_to_book(table);

    // Convert the workbook to a binary Excel file
    const excelBinary = XLSX.write(workbook, { bookType: "xlsx", type: "binary" });

    // Create a Blob object and download the file
    const blob = new Blob([s2ab(excelBinary)], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "salesReport.xlsx";
    link.click();

    // Utility function to convert a string to an ArrayBuffer
    function s2ab(s) {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xff;
      }
      return buf;
    }
    document.getElementById("downloadTable").hidden = true


}
  

function updateToDateMin() {
    const fromDateInput = document.getElementById('fromDate');
    const toDateInput = document.getElementById('toDate');
    
    const fromDate = new Date(fromDateInput.value);
    if (fromDate) {
      toDateInput.min = fromDate.toISOString().split('T')[0];
    }
  }



document.addEventListener('DOMContentLoaded', function () {
 
    var data = document.getElementById("myInputField").value;
    const total = data.split(',')
    var months = document.getElementById("myInputField2").value;
    const monthsArray = months.split(',');
  
    var options = {
      series: [{
        name: "Desktops",
        data: total
      }],
      chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'straight'
      },
      title: {
        text: 'Sales Trends by Month',
        align: 'left'
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.5
        },
      },
      xaxis: {
        categories: monthsArray,
      }
    };
  
    var chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();



    var paymentMode = document.getElementById("myInputField3").value;
    const paymentModeArray = paymentMode.split(',');
    var paymentCount = document.getElementById("myInputField4").value;
    const paymentCountArray = paymentCount.split(",").map(item => Number(item.trim()));


    var options = {
      series: paymentCountArray,
      chart: {
        width: 380,
        type: 'pie',
      },
      labels: paymentModeArray,
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    };

    var chart2 = new ApexCharts(document.querySelector("#payment"), options);
    chart2.render();

    var category = document.getElementById("myInputField6").value;
    const categoryArray = category.split(',');
    var categoryCount = document.getElementById("myInputField5").value;
    const categoryCountArray = categoryCount.split(",").map(item => Number(item.trim()));
    console.log(categoryCountArray);
    var xValues = categoryArray;
    var yValues = categoryCountArray;
    var barColors = ["red", "green", "blue", "orange", "brown"];

    new Chart("myChart", {
      type: "bar",
      data: {
        labels: xValues,
        datasets: [{
          backgroundColor: barColors,
          data: yValues
        }]
      },
      options: {
        legend: { display: false },
        title: {
          display: true,
          text: "Product sold in each category"
        }
      }
    });
})