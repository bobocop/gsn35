package hr.fer.rasip.wrappers;
import java.io.*;
import gsn.beans.AddressBean;
import gsn.beans.DataField;
import gsn.wrappers.AbstractWrapper;

import java.io.Serializable;

import org.apache.log4j.Logger;

import java.io.*;
import java.util.*;

public class test1_mz extends AbstractWrapper {
	
  private DataField[] collection = new DataField[] {new DataField("temperature", "double", "Rpi temperature")};
  private final transient Logger logger = Logger.getLogger(test1_mz.class);
  private int counter;
  private AddressBean params;
  private long rate = 1000;

  static String w1DirPath = "/sys/bus/w1/devices";
  
  
  public boolean initialize() {
  
    
     System.out.print("init\n");
     return true;
  }

  public void run() {
    //double temperature = 0;

    System.out.print("run1\n");
    
		     try {
		       ProcessBuilder pb = new ProcessBuilder(
		         "/Users/mario/Desktop/skripta.sh");
		       Process p = pb.start();     // Start the process.
		       p.waitFor();                // Wait for the process to finish.
		       System.out.println("Script executed successfully");
		     } catch (Exception e) {
		       e.printStackTrace();
		     }
    System.out.print("run2\n");
    
  }
  public DataField[] getOutputFormat() {
	   System.out.print("getOutputformat\n");
    return collection;
  }

  public String getWrapperName() {
	   System.out.print("getWrappername\n");
    return "test1_mz\n";
  }  

  public void dispose() {
	   System.out.print("dispose\n");
    counter--;
  }
    /*while (isActive()) {
      
        try{
          

          ProcessBuilder pb = new ProcessBuilder("python","temperature.py");
          Process proc = pb.start();
          //Process proc = Runtime.getRuntime().exec("python temperature.py");

          //Reader reader = new InputStreamReader(proc.getInputStream());
          BufferedReader reader = new BufferedReader(new InputStreamReader(proc.getInputStream()));
          while (reader == null);	//cekanje dok podatak nije spreman (!!!)
          String s = reader.readLine(); 

          try { 
            proc.waitFor();
          } catch (InterruptedException e) {
              logger.error(e.getMessage(), e);

          }

          proc.destroy();
          
          temperature = Double.parseDouble(s);

        }catch(IOException e){
          logger.error(e.getMessage(), e);
        }

      try { 
          
          //proc.waitFor();
            
            // post the data to GSN
          postStreamElement(new Serializable[] {temperature}); 
          System.out.println(temperature);
          Thread.sleep(rate); //delay



      } catch (InterruptedException e) {
        logger.error(e.getMessage(), e);

      }
	  
	  
            
    }*/

}  
